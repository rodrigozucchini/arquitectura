// ANILLO 3 · APPLICATION SERVICES: casos de uso. Coordina dominio + interfaces.
const { CalculadoraDescuentos } = require('./2-domain-services');

class CheckoutService {
  constructor(carritoRepo, clienteRepo) {
    this.carritoRepo = carritoRepo;
    this.clienteRepo = clienteRepo;
    this.calc = new CalculadoraDescuentos();
  }
  async checkout(carritoId, clienteId) {
    const carrito = await this.carritoRepo.obtener(carritoId);
    const vip = await this.clienteRepo.esVip(clienteId);
    const total = this.calc.calcular(carrito, vip);
    return { carritoId, clienteId, subtotal: carrito.subtotal().monto, total: total.monto, vip };
  }
}

module.exports = { CheckoutService };
