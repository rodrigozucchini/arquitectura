// API GATEWAY: punto de entrada ÚNICO frente a muchos servicios. Concentra las
// preocupaciones transversales (cross-cutting): autenticación, rate limiting, enrutamiento,
// caché, logging, circuit breaker, agregación y transformación.
//
// Ejecutar: node gateway.js
const http = require('node:http');

// ---- Servicios internos (uno lento y uno que falla, para mostrar cache y circuit breaker) ----
let fallosInventario = 0;
const internos = {
  catalogo: http.createServer((req, res) => setTimeout(() => res.end(JSON.stringify({ productos: ['A', 'B'], generado: Date.now() })), 200)).listen(7101),
  inventario: http.createServer((req, res) => (++fallosInventario <= 3 ? res.writeHead(500).end() : res.end('{"stock":9}'))).listen(7102),
};

// ---- Middlewares del gateway ----
const API_KEYS = new Set(['clave-123']);
const autenticar = (req) => API_KEYS.has(req.headers['x-api-key']);

const ventanas = new Map();
const rateLimit = (ip, max = 6, ms = 10_000) => {
  const ahora = Date.now();
  const v = (ventanas.get(ip) || []).filter((t) => ahora - t < ms);
  v.push(ahora);
  ventanas.set(ip, v);
  return v.length <= max;
};

const cache = new Map();

class CircuitBreaker {
  constructor(umbral = 2, enfriamiento = 1000) {
    Object.assign(this, { umbral, enfriamiento, fallos: 0, estado: 'CERRADO', abiertoEn: 0 });
  }
  async ejecutar(fn) {
    if (this.estado === 'ABIERTO') {
      if (Date.now() - this.abiertoEn < this.enfriamiento) throw new Error('circuito ABIERTO (fail fast)');
      this.estado = 'SEMI-ABIERTO';
    }
    try {
      const r = await fn();
      this.fallos = 0;
      this.estado = 'CERRADO';
      return r;
    } catch (e) {
      if (++this.fallos >= this.umbral || this.estado === 'SEMI-ABIERTO') {
        this.estado = 'ABIERTO';
        this.abiertoEn = Date.now();
      }
      throw e;
    }
  }
}

const rutas = {
  '/api/catalogo': { destino: 'http://localhost:7101', cacheMs: 5000, breaker: new CircuitBreaker() },
  '/api/inventario': { destino: 'http://localhost:7102', cacheMs: 0, breaker: new CircuitBreaker() },
};

const gateway = http.createServer(async (req, res) => {
  const t0 = Date.now();
  const responder = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
    console.log(`[gw] ${req.method} ${req.url} → ${code} (${Date.now() - t0}ms)`); // logging centralizado
  };
  if (!autenticar(req)) return responder(401, { error: 'API key inválida' });
  if (!rateLimit(req.socket.remoteAddress)) return responder(429, { error: 'demasiadas requests' });

  // Agregación: una sola llamada del cliente → varias llamadas internas
  if (req.url === '/api/home') {
    const [cat, inv] = await Promise.allSettled([llamar('/api/catalogo'), llamar('/api/inventario')]);
    return responder(200, { catalogo: cat.value ?? null, inventario: inv.value ?? 'no disponible' });
  }
  if (!rutas[req.url]) return responder(404, { error: 'ruta desconocida' });
  try {
    responder(200, await llamar(req.url));
  } catch (e) {
    responder(503, { error: e.message });
  }
});

async function llamar(ruta) {
  const r = rutas[ruta];
  const c = cache.get(ruta);
  if (c && Date.now() - c.t < r.cacheMs) return { ...c.data, desdeCache: true };
  return r.breaker.ejecutar(async () => {
    const resp = await fetch(r.destino);
    if (!resp.ok) throw new Error(`upstream ${resp.status}`);
    const data = await resp.json();
    cache.set(ruta, { t: Date.now(), data });
    return data;
  });
}

gateway.listen(7100, async () => {
  const get = async (path, key = 'clave-123') => {
    const r = await fetch(`http://localhost:7100${path}`, { headers: { 'x-api-key': key } });
    return `${r.status} ${await r.text()}`;
  };
  console.log('Sin API key   :', await get('/api/catalogo', 'mala'));
  console.log('Catálogo      :', await get('/api/catalogo'));
  console.log('Catálogo (2)  :', await get('/api/catalogo'), '← cache, sin esperar 200ms');
  console.log('Inventario    :', await get('/api/inventario'));
  console.log('Inventario    :', await get('/api/inventario'), '← 2 fallos: abre circuito');
  console.log('Inventario    :', await get('/api/inventario'), '← falla rápido sin llamar');
  console.log('Agregado home :', await get('/api/home'), '← 1 request → 2 servicios');
  console.log('Otra más      :', await get('/api/catalogo'), '← rate limit (máx 6 cada 10s)');
  for (const s of [gateway, ...Object.values(internos)]) (s.closeAllConnections(), s.close());
});
