// MICROKERNEL (Plug-in Architecture): un NÚCLEO mínimo con funcionalidad básica +
// PLUGINS independientes que extienden el sistema a través de puntos de extensión (hooks).
// El núcleo no conoce los plugins de antemano: los descubre y registra en runtime.
//
// Ejecutar: node core.js
const fs = require('node:fs');
const path = require('node:path');

class Kernel {
  constructor() {
    this.hooks = { 'texto:transformar': [], 'comando:registrar': [] };
    this.comandos = new Map();
    this.plugins = [];
  }
  // API que el kernel expone a los plugins (contrato)
  api() {
    return {
      agregarHook: (nombre, fn) => this.hooks[nombre].push(fn),
      registrarComando: (nombre, fn) => this.comandos.set(nombre, fn),
      log: (...a) => console.log('   [plugin]', ...a),
    };
  }
  cargarPlugins(dir) {
    for (const archivo of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
      const plugin = require(path.join(dir, archivo));
      plugin.registrar(this.api());
      this.plugins.push(plugin.nombre);
    }
    console.log('Plugins cargados:', this.plugins.join(', '));
  }
  // Funcionalidad del núcleo: procesar texto pasando por todos los hooks
  procesar(texto) {
    return this.hooks['texto:transformar'].reduce((t, fn) => fn(t), texto);
  }
  ejecutar(cmd, ...args) {
    const fn = this.comandos.get(cmd);
    return fn ? fn(...args) : `comando "${cmd}" no disponible (¿falta un plugin?)`;
  }
}

const kernel = new Kernel();
kernel.cargarPlugins(path.join(__dirname, 'plugins'));

console.log('\nprocesar():', kernel.procesar('hola mundo, esto es un ejemplo de microkernel'));
console.log('contar:', kernel.ejecutar('contar', 'uno dos tres'));
console.log('exportar:', kernel.ejecutar('exportar-pdf'));
