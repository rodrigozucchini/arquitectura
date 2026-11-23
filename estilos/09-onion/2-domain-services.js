// ANILLO 2 · DOMAIN SERVICES: lógica de dominio que no pertenece a una sola entidad
// + INTERFACES de repositorio (definidas acá, implementadas en infraestructura).
const { Dinero } = require('./1-domain-model');

class CalculadoraDescuentos {
  calcular(carrito, esClienteVip) {
    const sub = carrito.subtotal();
    const pct = (esClienteVip ? 0.15 : 0) + (sub.monto > 500 ? 0.05 : 0);
    return new Dinero(Math.round(sub.monto * (1 - pct)));
  }
}

/** @interface ICarritoRepositorio { obtener(id), guardar(carrito) } */
/** @interface IClienteRepositorio { esVip(clienteId) } */

module.exports = { CalculadoraDescuentos };
