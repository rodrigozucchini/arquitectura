// SAGA: maneja transacciones que abarcan VARIOS servicios (cada uno con su propia DB),
// donde no se puede usar una transacción ACID distribuida. Una saga es una secuencia de
// transacciones locales; si una falla, se ejecutan TRANSACCIONES COMPENSATORIAS para
// deshacer las anteriores.
//
// Ejecutar: node saga.js
// Muestra:  1) Saga ORQUESTADA (un coordinador central)
//           2) Saga COREOGRAFIADA (servicios reaccionando a eventos)
const { EventEmitter } = require('node:events');

// ---- "Microservicios" con sus datos locales ----
const servicios = {
  pedidos: {
    db: {},
    crear(id) { this.db[id] = 'PENDIENTE'; },
    cancelar(id) { this.db[id] = 'CANCELADO'; },
    aprobar(id) { this.db[id] = 'APROBADO'; },
  },
  pagos: {
    saldo: { ana: 100, luis: 10 },
    cobrar(u, monto) {
      if (this.saldo[u] < monto) throw new Error(`fondos insuficientes de ${u}`);
      this.saldo[u] -= monto;
    },
    reembolsar(u, monto) { this.saldo[u] += monto; },
  },
  inventario: {
    stock: { libro: 1 },
    reservar(item) {
      if (!this.stock[item]) throw new Error(`sin stock de ${item}`);
      this.stock[item]--;
    },
    liberar(item) { this.stock[item]++; },
  },
};

// ===================== 1) SAGA ORQUESTADA =====================
async function sagaOrquestada({ id, usuario, item, monto }) {
  const { pedidos, pagos, inventario } = servicios;
  const pasos = [
    { nombre: 'crear pedido', hacer: () => pedidos.crear(id), compensar: () => pedidos.cancelar(id) },
    { nombre: 'cobrar', hacer: () => pagos.cobrar(usuario, monto), compensar: () => pagos.reembolsar(usuario, monto) },
    { nombre: 'reservar stock', hacer: () => inventario.reservar(item), compensar: () => inventario.liberar(item) },
    { nombre: 'aprobar pedido', hacer: () => pedidos.aprobar(id), compensar: () => {} },
  ];
  const hechos = [];
  for (const paso of pasos) {
    try {
      await paso.hacer();
      hechos.push(paso);
      console.log(`  ✔ ${paso.nombre}`);
    } catch (e) {
      console.log(`  ✘ ${paso.nombre}: ${e.message} → compensando...`);
      for (const p of hechos.reverse()) {
        await p.compensar();
        console.log(`  ↩ compensado: ${p.nombre}`);
      }
      return;
    }
  }
}

// ===================== 2) SAGA COREOGRAFIADA =====================
function sagaCoreografiada(pedido) {
  const bus = new EventEmitter();
  const { pedidos, pagos, inventario } = servicios;
  return new Promise((fin) => {
    // Cada servicio escucha eventos y publica los suyos (sin coordinador)
    bus.on('PedidoCreado', (p) => {
      try { pagos.cobrar(p.usuario, p.monto); console.log('  [pagos] cobrado'); bus.emit('PagoRealizado', p); }
      catch (e) { console.log('  [pagos]', e.message); bus.emit('PagoFallido', p); }
    });
    bus.on('PagoRealizado', (p) => {
      try { inventario.reservar(p.item); console.log('  [inventario] reservado'); bus.emit('StockReservado', p); }
      catch (e) { console.log('  [inventario]', e.message); bus.emit('StockFallido', p); }
    });
    bus.on('StockFallido', (p) => { pagos.reembolsar(p.usuario, p.monto); console.log('  [pagos] ↩ reembolsado'); bus.emit('PagoFallido', p); });
    bus.on('PagoFallido', (p) => { pedidos.cancelar(p.id); console.log('  [pedidos] ↩ cancelado'); fin(); });
    bus.on('StockReservado', (p) => { pedidos.aprobar(p.id); console.log('  [pedidos] aprobado ✅'); fin(); });

    pedidos.crear(pedido.id);
    console.log('  [pedidos] creado');
    bus.emit('PedidoCreado', pedido);
  });
}

(async () => {
  console.log('ORQUESTADA · ana compra libro (OK)');
  await sagaOrquestada({ id: 1, usuario: 'ana', item: 'libro', monto: 30 });
  console.log('\nORQUESTADA · ana compra otro libro (sin stock → compensa el cobro)');
  await sagaOrquestada({ id: 2, usuario: 'ana', item: 'libro', monto: 30 });

  console.log('\nCOREOGRAFIADA · luis sin fondos');
  await sagaCoreografiada({ id: 3, usuario: 'luis', item: 'libro', monto: 30 });

  console.log('\nEstado final:', JSON.stringify({ pedidos: servicios.pedidos.db, saldos: servicios.pagos.saldo, stock: servicios.inventario.stock }));
})();
