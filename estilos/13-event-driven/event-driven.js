// EVENT-DRIVEN ARCHITECTURE (EDA): los componentes se comunican emitiendo y reaccionando
// a EVENTOS ("algo pasó"). El productor no conoce a los consumidores.
//
// Muestra las dos topologías:
//  1) BROKER (coreografía): cada servicio reacciona por su cuenta, sin coordinador.
//  2) MEDIATOR (orquestación): un mediador controla los pasos del flujo.
//
// Ejecutar: node event-driven.js

const { EventEmitter } = require('node:events');

// Un "message broker" mínimo con colas/topics y entrega asíncrona (como Kafka/RabbitMQ)
class Broker extends EventEmitter {
  publicar(topic, evento) {
    const e = { ...evento, topic, ts: new Date().toISOString() };
    console.log(`📣 ${topic}`, JSON.stringify(evento));
    setImmediate(() => this.emit(topic, e)); // asíncrono: el productor no espera
  }
  suscribir(topic, nombre, handler) {
    this.on(topic, async (e) => {
      try {
        await handler(e);
      } catch (err) {
        console.log(`   ❌ ${nombre} falló → a dead-letter queue`, err.message);
      }
    });
  }
}

// -------- 1) TOPOLOGÍA BROKER (coreografía) --------
const broker = new Broker();

broker.suscribir('OrdenCreada', 'inventario', (e) => {
  console.log(`   📦 inventario: reservando ${e.producto}`);
  broker.publicar('StockReservado', { ordenId: e.ordenId });
});
broker.suscribir('OrdenCreada', 'email', (e) => console.log(`   ✉️  email: "Gracias por tu orden ${e.ordenId}"`));
broker.suscribir('OrdenCreada', 'analytics', () => console.log('   📊 analytics: +1 venta'));
broker.suscribir('StockReservado', 'envios', (e) => console.log(`   🚚 envíos: preparando orden ${e.ordenId}`));

broker.publicar('OrdenCreada', { ordenId: 'A-1', producto: 'Bicicleta' });

// -------- 2) TOPOLOGÍA MEDIATOR (orquestación) --------
setTimeout(async () => {
  console.log('\n--- Topología Mediator ---');
  const pasos = {
    validar: async (o) => console.log('   ✔ validar', o.ordenId),
    cobrar: async (o) => console.log('   💳 cobrar', o.total),
    despachar: async (o) => console.log('   🚚 despachar', o.ordenId),
  };
  class Mediador {
    async manejar(evento) {
      for (const paso of ['validar', 'cobrar', 'despachar']) await pasos[paso](evento);
      console.log('   ✅ flujo completo');
    }
  }
  await new Mediador().manejar({ ordenId: 'B-2', total: 300 });
}, 50);
