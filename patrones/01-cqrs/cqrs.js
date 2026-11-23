// CQRS (Command Query Responsibility Segregation): separa el modelo de ESCRITURA
// (commands: cambian estado, validan reglas) del modelo de LECTURA (queries: vistas
// optimizadas/desnormalizadas). Se sincronizan mediante eventos (consistencia eventual).
//
// Ejecutar: node cqrs.js
const { EventEmitter } = require('node:events');
const bus = new EventEmitter();

// ===================== LADO DE ESCRITURA (Command side) =====================
const writeDb = { productos: new Map() }; // modelo normalizado, orientado a reglas

const commandHandlers = {
  CrearProducto({ id, nombre, precio }) {
    if (writeDb.productos.has(id)) throw new Error('Ya existe');
    if (precio <= 0) throw new Error('Precio inválido');
    writeDb.productos.set(id, { id, nombre, precio, ventas: 0 });
    bus.emit('ProductoCreado', { id, nombre, precio });
  },
  RegistrarVenta({ id, cantidad }) {
    const p = writeDb.productos.get(id);
    if (!p) throw new Error('No existe');
    p.ventas += cantidad;
    bus.emit('VentaRegistrada', { id, cantidad, importe: cantidad * p.precio });
  },
};

function enviarComando(tipo, payload) {
  commandHandlers[tipo](payload); // los commands NO devuelven datos
}

// ===================== LADO DE LECTURA (Query side) =====================
// Proyecciones desnormalizadas, pensadas para pantallas concretas
const readDb = { catalogo: [], ranking: new Map(), facturacionTotal: 0 };

bus.on('ProductoCreado', (e) => {
  readDb.catalogo.push({ id: e.id, titulo: `${e.nombre} - $${e.precio}` });
  readDb.ranking.set(e.id, { nombre: e.nombre, unidades: 0 });
});
bus.on('VentaRegistrada', (e) => {
  readDb.ranking.get(e.id).unidades += e.cantidad;
  readDb.facturacionTotal += e.importe;
});

const queries = {
  Catalogo: () => readDb.catalogo,
  TopVendidos: (n = 3) => [...readDb.ranking.values()].sort((a, b) => b.unidades - a.unidades).slice(0, n),
  Facturacion: () => readDb.facturacionTotal,
};

// ===================== Demo =====================
enviarComando('CrearProducto', { id: 'p1', nombre: 'Café', precio: 5 });
enviarComando('CrearProducto', { id: 'p2', nombre: 'Té', precio: 3 });
enviarComando('RegistrarVenta', { id: 'p2', cantidad: 10 });
enviarComando('RegistrarVenta', { id: 'p1', cantidad: 4 });

console.log('Query Catalogo:', queries.Catalogo());
console.log('Query TopVendidos:', queries.TopVendidos());
console.log('Query Facturacion:', queries.Facturacion());
