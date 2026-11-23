// SERVICIO DE DOMINIO "Ventas": grano GRUESO. Agrupa pedidos + facturación, que en
// microservicios serían dos servicios distintos. Internamente es un pequeño monolito
// (podría tener capas o arquitectura hexagonal por dentro).
const { transaccion } = require('../../shared/db');
const { crearServicio } = require('../../shared/http');

crearServicio('ventas', 4302, {
  'POST /pedidos': ({ clienteId, producto, total }) =>
    // UNA sola transacción ACID: valida el cliente, crea el pedido y la factura.
    // No hace falta Saga ni llamar por red a "clientes": la DB es compartida.
    transaccion((db) => {
      const cliente = db.clientes.find((c) => c.id === clienteId);
      if (!cliente) throw new Error('cliente inexistente');
      const pedido = { id: db.seq++, clienteId, producto, total };
      db.pedidos.push(pedido);
      db.facturas.push({ id: db.seq++, pedidoId: pedido.id, cliente: cliente.nombre, importe: total * 1.21 });
      return pedido;
    }),
});
