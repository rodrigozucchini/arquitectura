// Levanta cada microservicio como PROCESO SEPARADO (en producción: contenedores/pods).
// Ejecutar: node start-all.js
const { fork } = require('node:child_process');

const hijos = ['usuarios-service', 'pedidos-service', 'gateway'].map((s) => fork(`${__dirname}/${s}/index.js`));

// Si se detiene este proceso, se detienen también los servicios
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => (hijos.forEach((h) => h.kill()), process.exit()));

setTimeout(async () => {
  const r = await fetch('http://localhost:4100/pedidos', {
    method: 'POST',
    body: JSON.stringify({ usuarioId: 1, producto: 'Auriculares' }),
  });
  console.log('Demo POST /pedidos →', r.status, await r.json());
  console.log('Probá: curl localhost:4100/usuarios/2   |   Ctrl+C para salir');
}, 500);
