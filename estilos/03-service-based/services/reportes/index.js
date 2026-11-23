// SERVICIO DE DOMINIO "Reportes": lee directamente datos que escribieron OTROS servicios
// (clientes, pedidos, facturas) con un simple "join". Es la ventaja de compartir la DB...
// y también su riesgo: si "ventas" cambia el esquema de facturas, este servicio se rompe.
const { leer } = require('../../shared/db');
const { crearServicio } = require('../../shared/http');

crearServicio('reportes', 4303, {
  'GET /reportes/ventas-por-cliente': () => {
    const db = leer();
    return db.clientes.map((c) => {
      const pedidos = db.pedidos.filter((p) => p.clienteId === c.id);
      const facturado = db.facturas.filter((f) => pedidos.some((p) => p.id === f.pedidoId)).reduce((a, f) => a + f.importe, 0);
      return { cliente: c.nombre, pedidos: pedidos.length, facturado };
    });
  },
});
