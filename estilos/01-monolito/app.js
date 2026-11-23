// MONOLITO: toda la aplicación (UI/API, lógica y datos) vive en UN solo proceso
// y se despliega como UNA sola unidad. Todo comparte memoria y la misma "base de datos".
//
// Ejecutar:  node app.js   →  http://localhost:3001
//   curl -X POST localhost:3001/usuarios -d '{"nombre":"Ana"}'
//   curl -X POST localhost:3001/pedidos  -d '{"usuarioId":1,"producto":"Libro","total":20}'
//   curl localhost:3001/pedidos

const http = require('node:http');

// "Base de datos" única compartida por todo
const db = { usuarios: [], pedidos: [], seq: 1 };

// Lógica de negocio mezclada en el mismo código
function crearUsuario({ nombre }) {
  if (!nombre) throw new Error('nombre requerido');
  const u = { id: db.seq++, nombre };
  db.usuarios.push(u);
  return u;
}

function crearPedido({ usuarioId, producto, total }) {
  // Acceso directo a los datos de otra "parte" del sistema: fácil, pero acopla todo
  const usuario = db.usuarios.find((u) => u.id === usuarioId);
  if (!usuario) throw new Error('usuario no existe');
  const p = { id: db.seq++, usuarioId, producto, total, estado: 'CREADO' };
  db.pedidos.push(p);
  return p;
}

function leerBody(req) {
  return new Promise((ok) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => ok(b ? JSON.parse(b) : {}));
  });
}

const server = http.createServer(async (req, res) => {
  const send = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };
  try {
    if (req.method === 'POST' && req.url === '/usuarios') return send(201, crearUsuario(await leerBody(req)));
    if (req.method === 'GET' && req.url === '/usuarios') return send(200, db.usuarios);
    if (req.method === 'POST' && req.url === '/pedidos') return send(201, crearPedido(await leerBody(req)));
    if (req.method === 'GET' && req.url === '/pedidos') return send(200, db.pedidos);
    send(404, { error: 'no encontrado' });
  } catch (e) {
    send(400, { error: e.message });
  }
});

server.listen(3001, () => console.log('Monolito escuchando en http://localhost:3001'));
