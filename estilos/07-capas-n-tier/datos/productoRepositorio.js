// CAPA DE DATOS (persistencia): solo sabe guardar y leer. No tiene reglas de negocio.
const productos = [
  { id: 1, nombre: 'Notebook', precio: 1000, stock: 5 },
  { id: 2, nombre: 'Mouse', precio: 20, stock: 0 },
];

module.exports = {
  buscarTodos: () => productos,
  buscarPorId: (id) => productos.find((p) => p.id === id),
  actualizar: (p) => Object.assign(productos.find((x) => x.id === p.id), p),
};
