// CAPA 4 · FRAMEWORKS & DRIVERS (Web, DB, UI, dispositivos)
// Lo más externo y volátil. Aquí se compone todo (Composition Root).
// Ejecutar: node frameworks/main.js
const http = require('node:http');
const { RegistrarUsuario } = require('../use-cases/RegistrarUsuario');
const { UsuarioController, JsonPresenter, UsuarioGatewaySQL } = require('../interface-adapters');

// "Driver" de base de datos falso que imita una API SQL
const filas = [];
const fakeDb = {
  async query(sql, params = []) {
    if (sql.startsWith('SELECT COUNT')) return filas;
    if (sql.startsWith('SELECT')) return filas.filter((f) => f[1] === params[0]);
    if (sql.startsWith('INSERT')) filas.push(params);
    return [];
  },
};

http
  .createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', async () => {
      const presenter = new JsonPresenter();
      const casoDeUso = new RegistrarUsuario({ usuarioGateway: new UsuarioGatewaySQL(fakeDb), presenter });
      await new UsuarioController(casoDeUso).post(raw ? JSON.parse(raw) : {});
      res.writeHead(presenter.viewModel.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(presenter.viewModel.body) + '\n');
    });
  })
  .listen(3007, () =>
    console.log(`Clean Architecture en http://localhost:3007
  curl -X POST localhost:3007 -d '{"email":"ana@mail.com","nombre":"Ana"}'`)
  );
