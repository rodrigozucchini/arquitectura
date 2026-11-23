// MONOLITO MODULAR: un solo despliegue, pero dividido en módulos con límites claros
// (cada uno con sus datos privados y una API pública). Si mañana hace falta,
// un módulo se puede extraer como microservicio con poco esfuerzo.
//
// Ejecutar: node main.js

const { EventEmitter } = require('node:events');
const usuarios = require('./modules/usuarios');
const pedidosMod = require('./modules/pedidos');
const pagosMod = require('./modules/pagos');

const bus = new EventEmitter(); // bus de eventos interno (en memoria)

// Composición: el "main" cablea los módulos
const pedidos = pedidosMod.crearModulo({ usuarios, bus });
pagosMod.crearModulo({ bus });

bus.on('pago.aprobado', ({ pedidoId }) => pedidos.marcarPagado(pedidoId));

const ana = usuarios.crear('Ana');
pedidos.crear(ana.id, 'Teclado', 50);
console.log('Pedidos:', pedidos.listar());

try {
  pedidos.crear(999, 'Mouse', 10);
} catch (e) {
  console.log('Error esperado:', e.message);
}
