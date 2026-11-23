// Módulo USUARIOS: sus datos son privados. Solo se expone la API pública de abajo.
const usuarios = new Map();
let seq = 1;

function crear(nombre) {
  const u = { id: seq++, nombre };
  usuarios.set(u.id, u);
  return u;
}

function existe(id) {
  return usuarios.has(id);
}

// API PÚBLICA del módulo (contrato). Los otros módulos SOLO pueden usar esto.
module.exports = { crear, existe };
