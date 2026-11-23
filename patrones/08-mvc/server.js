// Router mínimo que delega en el Controller.
// Ejecutar: node server.js → abrir http://localhost:3005
const http = require('node:http');
const ctrl = require('./controllers/tareaController');

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/') return ctrl.index(req, res);
    if (url.pathname === '/agregar') return ctrl.agregar(req, res, url.searchParams);
    if (url.pathname === '/toggle') return ctrl.alternar(req, res, url.searchParams);
    res.writeHead(404).end();
  })
  .listen(3005, () => console.log('MVC en http://localhost:3005'));
