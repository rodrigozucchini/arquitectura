// SERVICIO DE DOMINIO "Clientes": grano GRUESO (toda la gestión de clientes).
const { transaccion, leer } = require('../../shared/db');
const { crearServicio } = require('../../shared/http');

crearServicio('clientes', 4301, {
  'POST /clientes': ({ nombre, email }) =>
    transaccion((db) => {
      if (!nombre || !email) throw new Error('nombre y email requeridos');
      const c = { id: db.seq++, nombre, email };
      db.clientes.push(c);
      return c;
    }),
  'GET /clientes': () => leer().clientes,
});
