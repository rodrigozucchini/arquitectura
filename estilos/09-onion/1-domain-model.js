// ANILLO 1 (núcleo) · DOMAIN MODEL: entidades y value objects. Cero dependencias.
class Dinero {
  constructor(monto, moneda = 'USD') {
    if (monto < 0) throw new Error('El dinero no puede ser negativo');
    this.monto = monto;
    this.moneda = moneda;
    Object.freeze(this); // Value Object inmutable
  }
  sumar(otro) {
    return new Dinero(this.monto + otro.monto, this.moneda);
  }
}

class Carrito {
  constructor(id) {
    this.id = id;
    this.items = [];
  }
  agregar(producto, precio, cantidad = 1) {
    this.items.push({ producto, precio: new Dinero(precio), cantidad });
  }
  subtotal() {
    return this.items.reduce((acc, i) => acc.sumar(new Dinero(i.precio.monto * i.cantidad)), new Dinero(0));
  }
}

module.exports = { Dinero, Carrito };
