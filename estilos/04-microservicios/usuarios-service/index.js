// MICROSERVICIO DE USUARIOS: proceso independiente, con SU PROPIA base de datos.
const http = require('node:http');
const PORT = process.env.PORT || 4101;

const db = new Map([[1, { id: 1, nombre: 'Ana' }], [2, { id: 2, nombre: 'Luis' }]]); // DB privada

http
  .createServer((req, res) => {
    const m = req.url.match(/^\/usuarios\/(\d+)$/);
    if (req.method === 'GET' && m) {
      const u = db.get(Number(m[1]));
      res.writeHead(u ? 200 : 404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(u ?? { error: 'no existe' }));
    }
    if (req.url === '/health') return res.end('ok');
    res.writeHead(404).end();
  })
  .listen(PORT, () => console.log(`[usuarios-service] :${PORT}`));
