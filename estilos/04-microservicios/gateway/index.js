// Punto de entrada único que enruta al microservicio correspondiente.
const http = require('node:http');

const rutas = { '/usuarios': 'http://localhost:4101', '/pedidos': 'http://localhost:4102' };

http
  .createServer((req, res) => {
    const prefijo = Object.keys(rutas).find((p) => req.url.startsWith(p));
    if (!prefijo) return res.writeHead(404).end('ruta desconocida');
    const destino = new URL(req.url, rutas[prefijo]);
    const proxy = http.request(destino, { method: req.method, headers: req.headers }, (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    });
    proxy.on('error', () => res.writeHead(502).end('servicio caído'));
    req.pipe(proxy);
  })
  .listen(4100, () => console.log('[gateway]          :4100'));
