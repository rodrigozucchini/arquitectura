// BASE DE DATOS COMPARTIDA: es la característica central de Service-Based.
// Todos los servicios leen y escriben la MISMA base (aquí, un archivo JSON).
// En producción sería un único PostgreSQL/Oracle con un esquema común.
const fs = require('node:fs');
const path = require('node:path');

const RUTA = path.join(__dirname, '..', 'db.json');
const VACIA = { clientes: [], pedidos: [], facturas: [], seq: 1 };

function leer() {
  try {
    return JSON.parse(fs.readFileSync(RUTA, 'utf8'));
  } catch {
    return structuredClone(VACIA);
  }
}

// Transacción simplificada: leer, modificar y escribir de forma síncrona.
// Al compartir la DB, varios servicios pueden participar en la misma "transacción" ACID.
function transaccion(fn) {
  const db = leer();
  const resultado = fn(db);
  fs.writeFileSync(RUTA, JSON.stringify(db, null, 2));
  return resultado;
}

const reiniciar = () => fs.writeFileSync(RUTA, JSON.stringify(VACIA));

module.exports = { leer, transaccion, reiniciar };
