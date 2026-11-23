module.exports = {
  nombre: 'contador',
  registrar(api) {
    api.registrarComando('contar', (texto) => {
      api.log('contando palabras');
      return texto.split(/\s+/).filter(Boolean).length;
    });
  },
};
