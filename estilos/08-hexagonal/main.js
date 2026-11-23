// COMPOSICIÓN: aquí (y solo aquí) se eligen qué adaptadores enchufar a los puertos.
// Ejecutar:
//   node main.js cli A B 30         → usa CLI + repo en memoria
//   node main.js http               → usa HTTP + repo en archivo
const { ServicioTransferencias } = require('./dominio/cuenta');
const { RepoEnMemoria, RepoArchivo, NotificadorConsola } = require('./adaptadores/salida');
const { adaptadorCLI, adaptadorHTTP } = require('./adaptadores/entrada');

const [modo = 'cli', ...args] = process.argv.slice(2);

if (modo === 'http') {
  const app = new ServicioTransferencias({ repo: new RepoArchivo(__dirname + '/cuentas.json'), notificador: new NotificadorConsola() });
  adaptadorHTTP(app, 3006);
} else {
  const repo = new RepoEnMemoria();
  const app = new ServicioTransferencias({ repo, notificador: new NotificadorConsola() });
  adaptadorCLI(app, args.length ? args : ['A', 'B', '30'])
    .then(() => console.log('Saldos:', Object.fromEntries(repo.datos)))
    .catch((e) => console.error('Error:', e.message));
}
