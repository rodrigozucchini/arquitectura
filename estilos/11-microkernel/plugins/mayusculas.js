module.exports = {
  nombre: 'mayusculas',
  registrar(api) {
    api.agregarHook('texto:transformar', (t) => t.toUpperCase());
  },
};
