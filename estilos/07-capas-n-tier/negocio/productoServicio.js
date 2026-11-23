// CAPA DE NEGOCIO (lógica/dominio): reglas. Solo habla con la capa de DATOS (la de abajo).
const repo = require('../datos/productoRepositorio');

module.exports = {
  listarDisponibles() {
    return repo.buscarTodos().filter((p) => p.stock > 0);
  },
  comprar(id, cantidad) {
    const p = repo.buscarPorId(id);
    if (!p) throw new Error('Producto inexistente');
    if (p.stock < cantidad) throw new Error('Stock insuficiente');
    const total = p.precio * cantidad * (cantidad >= 3 ? 0.9 : 1); // regla: 10% off por 3+
    repo.actualizar({ ...p, stock: p.stock - cantidad });
    return { producto: p.nombre, cantidad, total };
  },
};
