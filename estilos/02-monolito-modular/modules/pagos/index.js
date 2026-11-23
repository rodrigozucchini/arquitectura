// Módulo PAGOS: reacciona a eventos de pedidos, no conoce su implementación.
function crearModulo({ bus }) {
  bus.on('pedido.creado', (pedido) => {
    console.log(`[pagos] cobrando $${pedido.total} del pedido ${pedido.id}`);
    bus.emit('pago.aprobado', { pedidoId: pedido.id });
  });
  return {};
}

module.exports = { crearModulo };
