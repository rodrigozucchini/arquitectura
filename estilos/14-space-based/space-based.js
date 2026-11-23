// SPACE-BASED ARCHITECTURE (Tuple Space / Cloud Architecture):
// Elimina la base de datos como cuello de botella. Cada "processing unit" (PU) tiene los
// datos EN MEMORIA (data grid replicado). Un "data pump" escribe asincrónicamente a la DB.
// Un "virtualized middleware" enruta peticiones y agrega/quita PUs según la carga.
//
// Ejecutar: node space-based.js
const { EventEmitter } = require('node:events');

// Data grid: replicación entre PUs
const replicacion = new EventEmitter();

// Base de datos "lenta" que solo se usa de forma asíncrona
const baseDeDatos = [];

class ProcessingUnit {
  constructor(id) {
    this.id = id;
    this.cache = new Map(); // data grid en memoria (como Hazelcast/Apache Ignite)
    this.atendidas = 0;
    replicacion.on('put', ({ origen, k, v }) => origen !== this.id && this.cache.set(k, v));
  }
  procesar({ asiento, usuario }) {
    this.atendidas++;
    if (this.cache.get(asiento)) return `PU-${this.id}: asiento ${asiento} OCUPADO`;
    this.cache.set(asiento, usuario);
    replicacion.emit('put', { origen: this.id, k: asiento, v: usuario }); // replica a otras PUs
    dataPump.push({ asiento, usuario }); // persistencia asíncrona
    return `PU-${this.id}: asiento ${asiento} reservado para ${usuario}`;
  }
}

// Data pump: vuelca a la DB en lotes, fuera del camino crítico
const dataPump = [];
setInterval(() => {
  if (dataPump.length) {
    baseDeDatos.push(...dataPump.splice(0));
    console.log(`   💾 data pump: ${baseDeDatos.length} filas en la DB`);
  }
}, 30).unref();

// Middleware virtualizado: processing grid + deployment manager (autoescalado)
class Middleware {
  constructor() {
    this.pus = [new ProcessingUnit(1)];
    this.rr = 0;
  }
  escalarSiHaceFalta(carga) {
    const necesarias = Math.min(4, Math.ceil(carga / 3));
    while (this.pus.length < necesarias) {
      const pu = new ProcessingUnit(this.pus.length + 1);
      // la nueva PU se "calienta" copiando el grid de otra
      this.pus[0].cache.forEach((v, k) => pu.cache.set(k, v));
      this.pus.push(pu);
      console.log(`   ⬆️  deployment manager: nueva PU-${pu.id}`);
    }
  }
  enrutar(req) {
    const pu = this.pus[this.rr++ % this.pus.length]; // round robin
    return pu.procesar(req);
  }
}

// Demo: pico de tráfico (venta de entradas para un concierto)
const mw = new Middleware();
const peticiones = [
  { asiento: 'A1', usuario: 'ana' }, { asiento: 'A2', usuario: 'luis' }, { asiento: 'A1', usuario: 'eva' },
  { asiento: 'B1', usuario: 'juan' }, { asiento: 'A2', usuario: 'sol' }, { asiento: 'B2', usuario: 'leo' },
  { asiento: 'C1', usuario: 'mia' }, { asiento: 'B1', usuario: 'tom' }, { asiento: 'C2', usuario: 'ivi' },
];
mw.escalarSiHaceFalta(peticiones.length);
peticiones.forEach((p) => console.log(mw.enrutar(p)));
setTimeout(() => console.log('Carga por PU:', mw.pus.map((p) => `PU-${p.id}=${p.atendidas}`).join(' ')), 60);
