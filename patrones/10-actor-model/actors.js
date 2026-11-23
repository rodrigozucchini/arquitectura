// ACTOR MODEL: todo es un ACTOR. Cada actor tiene estado PRIVADO, un BUZÓN (mailbox) y
// procesa UN mensaje a la vez. Los actores solo se comunican enviando mensajes
// asíncronos (nunca comparten memoria → no hay locks ni race conditions).
// Un actor puede: cambiar su estado, enviar mensajes, crear otros actores.
// Supervisión: si un actor hijo falla, su supervisor decide (reiniciar, detener...).
//
// Ejecutar: node actors.js
// (Usamos worker_threads para que cada actor "cuenta" corra en paralelo real.)
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');

if (!isMainThread) {
  // ======== CÓDIGO DEL ACTOR (corre en su propio hilo) ========
  let saldo = workerData.saldoInicial; // estado privado: nadie más puede tocarlo
  parentPort.on('message', (msg) => {
    // El buzón entrega los mensajes de a uno, en orden
    switch (msg.tipo) {
      case 'depositar':
        saldo += msg.monto;
        break;
      case 'retirar':
        if (msg.monto > saldo) return parentPort.postMessage({ tipo: 'error', id: workerData.id, razon: 'saldo insuficiente', respuestaA: msg.ref });
        saldo -= msg.monto;
        break;
      case 'explotar':
        throw new Error('fallo inesperado'); // para demostrar supervisión
      case 'consultar':
        return parentPort.postMessage({ tipo: 'saldo', id: workerData.id, saldo, respuestaA: msg.ref });
    }
    parentPort.postMessage({ tipo: 'ok', respuestaA: msg.ref });
  });
} else {
  // ======== SISTEMA DE ACTORES + SUPERVISOR (hilo principal) ========
  class ActorRef {
    constructor(id, saldoInicial, supervisor) {
      Object.assign(this, { id, saldoInicial, supervisor, pendientes: new Map(), seq: 0 });
      this.iniciar();
    }
    iniciar() {
      this.worker = new Worker(__filename, { workerData: { id: this.id, saldoInicial: this.saldoInicial } });
      this.worker.on('message', (m) => {
        this.pendientes.get(m.respuestaA)?.(m);
        this.pendientes.delete(m.respuestaA);
      });
      this.worker.on('error', (e) => this.supervisor.hijoFallo(this, e));
    }
    // "tell" (fire-and-forget) y "ask" (espera respuesta)
    tell(msg) {
      this.worker.postMessage(msg);
    }
    ask(msg) {
      return new Promise((ok) => {
        const ref = ++this.seq;
        this.pendientes.set(ref, ok);
        this.worker.postMessage({ ...msg, ref });
      });
    }
    detener() {
      return this.worker.terminate();
    }
  }

  const supervisor = {
    // Estrategia "one-for-one": reinicia solo el actor que falló (estilo Erlang/Akka: "let it crash")
    hijoFallo(actor, e) {
      console.log(`  🔥 supervisor: ${actor.id} falló (${e.message}) → reiniciando con estado inicial`);
      actor.iniciar();
    },
  };

  (async () => {
    const ana = new ActorRef('cuenta-ana', 100, supervisor);
    const luis = new ActorRef('cuenta-luis', 0, supervisor);

    // 1000 depósitos concurrentes sobre el MISMO actor: sin locks y sin perder ninguno
    await Promise.all(Array.from({ length: 1000 }, () => ana.ask({ tipo: 'depositar', monto: 1 })));
    console.log('ana tras 1000 depósitos concurrentes:', (await ana.ask({ tipo: 'consultar' })).saldo);

    // Transferencia = intercambio de mensajes
    const r = await ana.ask({ tipo: 'retirar', monto: 300 });
    if (r.tipo === 'ok') luis.tell({ tipo: 'depositar', monto: 300 });
    console.log('luis:', (await luis.ask({ tipo: 'consultar' })).saldo, '| ana:', (await ana.ask({ tipo: 'consultar' })).saldo);

    const err = await ana.ask({ tipo: 'retirar', monto: 99999 });
    console.log('retiro inválido →', err.razon);

    // Let it crash
    luis.tell({ tipo: 'explotar' });
    await new Promise((res) => setTimeout(res, 200));
    console.log('luis después del reinicio:', (await luis.ask({ tipo: 'consultar' })).saldo);

    await Promise.all([ana.detener(), luis.detener()]);
  })();
}
