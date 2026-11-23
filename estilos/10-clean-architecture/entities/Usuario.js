// CAPA 1 · ENTITIES (Enterprise Business Rules)
// Reglas de negocio más generales y estables. No dependen de NADA.
class Usuario {
  constructor({ id, email, nombre }) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Email inválido');
    if (!nombre || nombre.trim().length < 2) throw new Error('Nombre inválido');
    this.id = id;
    this.email = email.toLowerCase();
    this.nombre = nombre.trim();
  }
}
module.exports = { Usuario };
