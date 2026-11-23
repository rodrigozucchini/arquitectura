// MICROSERVICIO DE PEDIDOS: tiene su propia DB y consulta a usuarios por la RED (HTTP),
// nunca accediendo a su base de datos directamente.
const http = require('node:http');
const PORT = process.env.PORT || 4102;
const USUARIOS_URL = process.env.USUARIOS_URL || 'http://localhost:4101';

const pedidos = []; // DB privada
let seq = 1;

async function obtenerUsuario(id) {
  // Comunicación síncrona entre servicios + manejo de fallos (timeout)
  const r = await fetch(`${USUARIOS_URL}/usuarios/${id}`, { signal: AbortSignal.timeout(1000) });
  if (!r.ok) return null;
  return r.json();
}

http
  .createServer(async (req, res) => {
    const json = (c, d) => {
      res.writeHead(c, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(d));
    };
    if (req.method === 'POST' && req.url === '/pedidos') {
      let raw = '';
      for await (const c of req) raw += c;
      const { usuarioId, producto } = JSON.parse(raw || '{}');
      try {
        const usuario = await obtenerUsuario(usuarioId);
        if (!usuario) return json(400, { error: 'usuario inválido' });
        const p = { id: seq++, usuario: usuario.nombre, producto };
        pedidos.push(p);
        return json(201, p);
      } catch {
        return json(503, { error: 'usuarios-service no disponible' }); // degradación controlada
      }
    }
    if (req.url === '/pedidos') return json(200, pedidos);
    if (req.url === '/health') return res.end('ok');
    res.writeHead(404).end();
  })
  .listen(PORT, () => console.log(`[pedidos-service]  :${PORT}`));
