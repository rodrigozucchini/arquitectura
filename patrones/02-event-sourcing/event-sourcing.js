// EVENT SOURCING: en vez de guardar el ESTADO ACTUAL, se guarda la SECUENCIA de eventos
// que lo produjo (append-only). El estado se reconstruye "reproduciendo" (replay) los eventos.
//
// Ejecutar: node event-sourcing.js

// ---- Event Store (solo se agregan eventos, nunca se modifican ni borran) ----
class EventStore {
  constructor() {
    this.eventos = [];
  }
  append(streamId, tipo, datos, versionEsperada) {
    const actuales = this.leer(streamId);
    // Control de concurrencia optimista
    if (versionEsperada !== undefined && actuales.length !== versionEsperada) {
      throw new Error(`Conflicto de concurrencia en ${streamId}`);
    }
    const e = { streamId, version: actuales.length + 1, tipo, datos, fecha: new Date().toISOString() };
    this.eventos.push(Object.freeze(e));
    return e;
  }
  leer(streamId) {
    return this.eventos.filter((e) => e.streamId === streamId);
  }
}

// ---- Agregado: su estado se deriva de los eventos ----
class CuentaBancaria {
  constructor() {
    this.saldo = 0;
    this.abierta = false;
    this.version = 0;
  }
  static reconstruir(eventos) {
    const c = new CuentaBancaria();
    eventos.forEach((e) => c.aplicar(e));
    return c;
  }
  aplicar(e) {
    switch (e.tipo) {
      case 'CuentaAbierta': this.abierta = true; this.titular = e.datos.titular; break;
      case 'DineroDepositado': this.saldo += e.datos.monto; break;
      case 'DineroRetirado': this.saldo -= e.datos.monto; break;
    }
    this.version = e.version;
  }
  // Los comandos validan contra el estado y DEVUELVEN eventos nuevos
  retirar(monto) {
    if (monto > this.saldo) throw new Error('Saldo insuficiente');
    return ['DineroRetirado', { monto }];
  }
}

// ---- Demo ----
const store = new EventStore();
store.append('cuenta-1', 'CuentaAbierta', { titular: 'Ana' });
store.append('cuenta-1', 'DineroDepositado', { monto: 100 });
store.append('cuenta-1', 'DineroDepositado', { monto: 50 });

let cuenta = CuentaBancaria.reconstruir(store.leer('cuenta-1'));
store.append('cuenta-1', ...cuenta.retirar(30), cuenta.version);

cuenta = CuentaBancaria.reconstruir(store.leer('cuenta-1'));
console.log('Estado actual:', { titular: cuenta.titular, saldo: cuenta.saldo, version: cuenta.version });

console.log('\nHistorial completo (auditoría gratis):');
store.leer('cuenta-1').forEach((e) => console.log(`  v${e.version} ${e.tipo}`, e.datos));

// "Viaje en el tiempo": estado en la versión 2
const enV2 = CuentaBancaria.reconstruir(store.leer('cuenta-1').slice(0, 2));
console.log('\nSaldo en la versión 2:', enV2.saldo);

// Concurrencia: alguien intenta escribir con una versión vieja
try {
  store.append('cuenta-1', 'DineroRetirado', { monto: 10 }, 2);
} catch (e) {
  console.log('\n' + e.message);
}
