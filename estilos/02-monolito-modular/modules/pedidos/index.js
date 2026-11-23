// Módulo PEDIDOS: depende de la API pública de usuarios, nunca de sus datos internos.
const pedidos = [];
let seq = 1;

function crearModulo({ usuarios, bus }) {
  return {
    crear(usuarioId, producto, total) {
      if (!usuarios.existe(usuarioId)) throw new Error('usuario no existe');
      const p = { id: seq++, usuarioId, producto, total, estado: 'PENDIENTE' };
      pedidos.push(p);
      // Comunicación desacoplada entre módulos mediante eventos en memoria
      bus.emit('pedido.creado', p);
      return p;
    },
    marcarPagado(id) {
      const p = pedidos.find((x) => x.id === id);
      if (p) p.estado = 'PAGADO';
    },
    listar: () => [...pedidos],
  };
}

module.exports = { crearModulo };
