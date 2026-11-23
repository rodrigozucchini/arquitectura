// BROKER PATTERN: un intermediario (broker) desacopla clientes de servidores.
// Los servidores se REGISTRAN en el broker; los clientes piden un servicio por NOMBRE
// sin saber dónde está ni quién lo atiende. El broker localiza, reenvía y balancea.
// (Base de CORBA, Java RMI, gRPC con service discovery, message brokers como RabbitMQ.)
//
// Ejecutar: node broker.js

class Broker {
  constructor() {
    this.registro = new Map(); // nombre servicio → [instancias]
    this.colas = new Map(); // para mensajería asíncrona
  }
  // ---- Registro / descubrimiento ----
  registrar(servicio, instancia) {
    if (!this.registro.has(servicio)) this.registro.set(servicio, []);
    this.registro.get(servicio).push(instancia);
    console.log(`[broker] registrado ${servicio} → ${instancia.nombre}`);
  }
  // ---- Petición/respuesta (RPC) con balanceo ----
  async solicitar(servicio, metodo, ...args) {
    const instancias = this.registro.get(servicio) || [];
    const vivas = instancias.filter((i) => i.vivo);
    if (!vivas.length) throw new Error(`No hay instancias de ${servicio}`);
    const elegida = vivas[Math.floor(Math.random() * vivas.length)];
    // Proxy del lado cliente/servidor: (de)serialización, como haría un stub
    const mensaje = JSON.stringify({ metodo, args });
    const { metodo: m, args: a } = JSON.parse(mensaje);
    return { atendidoPor: elegida.nombre, resultado: await elegida[m](...a) };
  }
  // ---- Mensajería asíncrona (cola punto a punto) ----
  encolar(cola, msg) {
    if (!this.colas.has(cola)) this.colas.set(cola, { msgs: [], consumidores: [] });
    const c = this.colas.get(cola);
    c.msgs.push(msg);
    this._despachar(c);
  }
  consumir(cola, nombre, fn) {
    if (!this.colas.has(cola)) this.colas.set(cola, { msgs: [], consumidores: [] });
    const c = this.colas.get(cola);
    c.consumidores.push({ nombre, fn });
    this._despachar(c);
  }
  _despachar(c) {
    while (c.msgs.length && c.consumidores.length) {
      c.rr = (c.rr ?? -1) + 1; // round robin entre consumidores (competing consumers)
      const consumidor = c.consumidores[c.rr % c.consumidores.length];
      consumidor.fn(c.msgs.shift(), consumidor.nombre);
    }
  }
}

// Servidores que ofrecen servicios
const crearCalculadora = (nombre) => ({
  nombre,
  vivo: true,
  sumar: (a, b) => a + b,
  multiplicar: (a, b) => a * b,
});

const broker = new Broker();
const calc1 = crearCalculadora('calc-server-1');
broker.registrar('calculadora', calc1);
broker.registrar('calculadora', crearCalculadora('calc-server-2'));

(async () => {
  console.log(await broker.solicitar('calculadora', 'sumar', 2, 3));
  console.log(await broker.solicitar('calculadora', 'multiplicar', 4, 5));
  calc1.vivo = false; // cae un servidor: el cliente no se entera
  console.log(await broker.solicitar('calculadora', 'sumar', 10, 10));

  console.log('\n-- Mensajería asíncrona --');
  broker.encolar('emails', 'bienvenida a ana'); // se guarda aunque no haya consumidores aún
  broker.consumir('emails', 'worker-1', (m, w) => console.log(`${w} procesa: ${m}`));
  broker.consumir('emails', 'worker-2', (m, w) => console.log(`${w} procesa: ${m}`));
  ['factura a luis', 'reset password eva', 'promo a todos'].forEach((m) => broker.encolar('emails', m));
})();
