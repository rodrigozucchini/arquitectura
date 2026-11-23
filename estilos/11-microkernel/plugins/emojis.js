module.exports = {
  nombre: 'emojis',
  registrar(api) {
    api.agregarHook('texto:transformar', (t) => t.replace(/HOLA/gi, '👋').replace(/MUNDO/gi, '🌍'));
  },
};
