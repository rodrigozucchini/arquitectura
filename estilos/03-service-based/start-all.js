// SERVICE-BASED ARCHITECTURE: pocos servicios de dominio GRANDES (normalmente 4 a 12),
// cada uno desplegado por separado, que COMPARTEN UNA BASE DE DATOS. Una capa de UI o
// un gateway los llama. Es el punto medio entre el monolito y los microservicios.
//
// Ejecutar: node start-all.js
const { fork } = require('node:child_process');
const { reiniciar } = require('./shared/db');

reiniciar();
// Cada servicio es un PROCESO independiente (se despliega y escala por separado)
const procesos = ['clientes', 'ventas', 'reportes'].map((s) => fork(`${__dirname}/services/${s}/index.js`));

const llamar = async (puerto, metodo, ruta, body) => {
  const r = await fetch(`http://localhost:${puerto}${ruta}`, { method: metodo, body: body && JSON.stringify(body) });
  return r.json();
};

setTimeout(async () => {
  const ana = await llamar(4301, 'POST', '/clientes', { nombre: 'Ana', email: 'ana@mail.com' });
  const luis = await llamar(4301, 'POST', '/clientes', { nombre: 'Luis', email: 'luis@mail.com' });
  await llamar(4302, 'POST', '/pedidos', { clienteId: ana.id, producto: 'Notebook', total: 1000 });
  await llamar(4302, 'POST', '/pedidos', { clienteId: ana.id, producto: 'Mouse', total: 20 });
  await llamar(4302, 'POST', '/pedidos', { clienteId: luis.id, producto: 'Monitor', total: 300 });
  console.log('Pedido inválido →', await llamar(4302, 'POST', '/pedidos', { clienteId: 999, producto: 'X', total: 1 }));
  console.log('\nReporte (join directo sobre la DB compartida):');
  console.table(await llamar(4303, 'GET', '/reportes/ventas-por-cliente'));
  console.log('Mirá db.json: es UNA base usada por los 3 servicios.');
  procesos.forEach((p) => p.kill());
}, 500);
