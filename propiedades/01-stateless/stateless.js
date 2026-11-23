// STATELESS (sin estado): el servidor NO guarda nada sobre el cliente entre peticiones.
// Cada request trae TODO lo necesario (aquí, un token firmado con los datos de sesión).
// Por eso cualquier instancia puede atender cualquier request → escalado horizontal trivial.
//
// Ejecutar: node stateless.js
// Levanta 3 instancias detrás de un balanceador round-robin y demuestra que da igual
// cuál atienda cada request.
const http = require('node:http');
const crypto = require('node:crypto');

const SECRETO = 'clave-compartida-entre-instancias';

// Token tipo JWT minimalista: payload.firma (HMAC)
const firmar = (obj) => {
  const p = Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${p}.${crypto.createHmac('sha256', SECRETO).update(p).digest('base64url')}`;
};
const verificar = (token = '') => {
  const [p, f] = token.split('.');
  if (!p || !f) return null;
  const esperada = crypto.createHmac('sha256', SECRETO).update(p).digest('base64url');
  if (f.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(f), Buffer.from(esperada))) return null;
  return JSON.parse(Buffer.from(p, 'base64url').toString());
};

function crearInstancia(id, puerto) {
  // ⚠️ NO hay variables con datos de usuarios acá. Nada en memoria entre requests.
  return http
    .createServer((req, res) => {
      const url = new URL(req.url, 'http://x');
      if (url.pathname === '/login') {
        const token = firmar({ usuario: url.searchParams.get('u'), carrito: [] });
        return res.end(JSON.stringify({ instancia: id, token }));
      }
      if (url.pathname === '/agregar') {
        const sesion = verificar(req.headers.authorization);
        if (!sesion) return res.writeHead(401).end('token inválido');
        sesion.carrito.push(url.searchParams.get('item'));
        // El "estado" nuevo vuelve al cliente, que lo enviará en la próxima request
        return res.end(JSON.stringify({ instancia: id, usuario: sesion.usuario, carrito: sesion.carrito, token: firmar(sesion) }));
      }
      res.writeHead(404).end();
    })
    .listen(puerto);
}

const instancias = [crearInstancia('A', 6001), crearInstancia('B', 6002), crearInstancia('C', 6003)];

// Balanceador round-robin (sin sticky sessions: no las necesita)
let rr = 0;
const balancear = (path, token) =>
  fetch(`http://localhost:${6001 + (rr++ % 3)}${path}`, { headers: token ? { authorization: token } : {} }).then((r) => r.json());

(async () => {
  let r = await balancear('/login?u=ana');
  console.log(`login         → instancia ${r.instancia}`);
  for (const item of ['manzana', 'pan', 'leche']) {
    r = await balancear(`/agregar?item=${item}`, r.token);
    console.log(`agregar ${item.padEnd(7)} → instancia ${r.instancia}  carrito=${JSON.stringify(r.carrito)}`);
  }
  console.log('\nCada request la atendió una instancia distinta y el carrito NUNCA se perdió,');
  console.log('porque el estado viaja con la petición (o viviría en un store externo como Redis/DB).');
  instancias.forEach((s) => (s.closeAllConnections(), s.close()));
})();
