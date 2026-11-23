// CAPA DE PRESENTACIÓN: interactúa con el usuario. Solo habla con la capa de NEGOCIO.
// Ejecutar: node presentacion/consola.js
const servicio = require('../negocio/productoServicio');

console.log('Productos disponibles:', servicio.listarDisponibles());
console.log('Compra:', servicio.comprar(1, 3));
try {
  servicio.comprar(2, 1);
} catch (e) {
  console.log('Error:', e.message);
}
