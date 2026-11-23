// ADAPTADORES DE SALIDA (driven): implementan los puertos de salida con tecnología concreta.
const { Cuenta } = require('../dominio/cuenta');

// Adaptador 1: repositorio en memoria (ideal para tests)
class RepoEnMemoria {
  constructor() {
    this.datos = new Map([
      ['A', 100],
      ['B', 50],
    ]);
  }
  async obtener(id) {
    if (!this.datos.has(id)) throw new Error(`Cuenta ${id} no existe`);
    return new Cuenta(id, this.datos.get(id));
  }
  async guardar(c) {
    this.datos.set(c.id, c.saldo);
  }
}

// Adaptador 2: repositorio en archivo JSON (cambia la tecnología, el dominio NO se entera)
const fs = require('node:fs/promises');
class RepoArchivo {
  constructor(ruta) {
    this.ruta = ruta;
  }
  async _leer() {
    try {
      return JSON.parse(await fs.readFile(this.ruta, 'utf8'));
    } catch {
      return { A: 100, B: 50 };
    }
  }
  async obtener(id) {
    const d = await this._leer();
    if (!(id in d)) throw new Error(`Cuenta ${id} no existe`);
    return new Cuenta(id, d[id]);
  }
  async guardar(c) {
    const d = await this._leer();
    d[c.id] = c.saldo;
    await fs.writeFile(this.ruta, JSON.stringify(d));
  }
}

class NotificadorConsola {
  async notificar(msg) {
    console.log('[email simulado]', msg);
  }
}

module.exports = { RepoEnMemoria, RepoArchivo, NotificadorConsola };
