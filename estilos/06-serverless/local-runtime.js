// Simulador de una plataforma serverless (AWS Lambda/Azure Functions/Cloud Functions):
// - Cada invocación carga la función "en frío" la primera vez (cold start)
// - Eventos de storage disparan otras funciones
// - Se cobra por invocación/duración (mostramos métricas)
//
// Ejecutar: node local-runtime.js
const http = require('node:http');

const metricas = { invocaciones: 0, msTotales: 0, coldStarts: 0 };
const cache = new Map(); // contenedores "calientes"

async function invocar(nombreFn, event) {
  const t0 = performance.now();
  if (!cache.has(nombreFn)) {
    metricas.coldStarts++;
    await new Promise((r) => setTimeout(r, 150)); // simula cold start
    cache.set(nombreFn, require(`./functions/${nombreFn}`));
  }
  const res = await cache.get(nombreFn).handler(event, { services });
  metricas.invocaciones++;
  metricas.msTotales += performance.now() - t0;
  return res;
}

// Servicios gestionados (BaaS) simulados
const bucket = new Map();
const triggers = { 'uploads/': 'generarMiniatura' }; // configuración tipo serverless.yml
const services = {
  storage: {
    async put(key, valor) {
      bucket.set(key, valor);
      const prefijo = Object.keys(triggers).find((p) => key.startsWith(p));
      if (prefijo) setImmediate(() => invocar(triggers[prefijo], { Records: [{ s3: { object: { key } } }] }));
    },
  },
};

// API Gateway simulado
const rutas = { 'POST /imagenes': 'crearImagen' };
http
  .createServer(async (req, res) => {
    const fn = rutas[`${req.method} ${req.url}`];
    if (req.url === '/metricas') return res.end(JSON.stringify({ ...metricas, archivos: [...bucket.keys()] }, null, 2));
    if (!fn) return res.writeHead(404).end();
    let body = '';
    for await (const c of req) body += c;
    const r = await invocar(fn, { body, headers: req.headers });
    res.writeHead(r.statusCode, { 'Content-Type': 'application/json' }).end(r.body);
  })
  .listen(3014, () =>
    console.log(`Runtime serverless en :3014
  curl -X POST localhost:3014/imagenes -d '{"nombre":"gato.png"}'
  curl localhost:3014/metricas`)
  );
