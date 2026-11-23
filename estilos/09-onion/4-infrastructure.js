// ANILLO 4 (externo) · INFRASTRUCTURE / UI / TESTS: implementaciones concretas.
// Ejecutar: node 4-infrastructure.js
const { Carrito } = require('./1-domain-model');
const { CheckoutService } = require('./3-application-services');

class CarritoRepoMemoria {
  constructor() {
    const c = new Carrito('c1');
    c.agregar('Monitor', 300);
    c.agregar('Cable HDMI', 15, 2);
    c.agregar('Silla', 250);
    this.db = new Map([['c1', c]]);
  }
  async obtener(id) {
    return this.db.get(id);
  }
  async guardar(c) {
    this.db.set(c.id, c);
  }
}

class ClienteRepoMemoria {
  async esVip(id) {
    return id === 'vip-1';
  }
}

const app = new CheckoutService(new CarritoRepoMemoria(), new ClienteRepoMemoria());
(async () => {
  console.log('Cliente normal:', await app.checkout('c1', 'cliente-7'));
  console.log('Cliente VIP:  ', await app.checkout('c1', 'vip-1'));
})();
