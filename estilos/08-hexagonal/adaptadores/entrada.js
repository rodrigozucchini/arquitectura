// ADAPTADORES DE ENTRADA (driving): traducen el mundo exterior (HTTP, CLI, cola...) al puerto de entrada.

// Adaptador CLI
function adaptadorCLI(casoDeUso, argv) {
  const [origen, destino, monto] = argv;
  return casoDeUso.transferir(origen, destino, Number(monto));
}

// Adaptador HTTP
const http = require('node:http');
function adaptadorHTTP(casoDeUso, puerto) {
  return http
    .createServer(async (req, res) => {
      const u = new URL(req.url, 'http://x');
      try {
        await casoDeUso.transferir(u.searchParams.get('de'), u.searchParams.get('a'), Number(u.searchParams.get('monto')));
        res.end('ok\n');
      } catch (e) {
        res.writeHead(400).end(e.message + '\n');
      }
    })
    .listen(puerto, () => console.log(`HTTP en http://localhost:${puerto}/?de=A&a=B&monto=10`));
}

module.exports = { adaptadorCLI, adaptadorHTTP };
