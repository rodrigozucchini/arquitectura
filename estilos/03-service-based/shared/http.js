// Utilidad mínima compartida para levantar cada servicio.
const http = require('node:http');

function crearServicio(nombre, puerto, rutas) {
  return http
    .createServer(async (req, res) => {
      let raw = '';
      for await (const c of req) raw += c;
      const handler = rutas[`${req.method} ${req.url}`];
      const json = (code, data) => res.writeHead(code, { 'Content-Type': 'application/json' }).end(JSON.stringify(data));
      if (!handler) return json(404, { error: 'ruta desconocida' });
      try {
        json(200, await handler(raw ? JSON.parse(raw) : {}));
      } catch (e) {
        json(400, { error: e.message });
      }
    })
    .listen(puerto, () => console.log(`[${nombre}] :${puerto}`));
}

module.exports = { crearServicio };
