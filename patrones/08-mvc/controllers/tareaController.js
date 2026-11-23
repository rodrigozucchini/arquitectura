// CONTROLLER: recibe la entrada del usuario, actualiza el Model y elige la View.
const Tarea = require('../models/tareaModel');
const vista = require('../views/tareasView');

module.exports = {
  index(req, res, error) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(vista(Tarea.todas(), error));
  },
  agregar(req, res, params) {
    try {
      Tarea.agregar(params.get('titulo'));
      res.writeHead(302, { Location: '/' }).end();
    } catch (e) {
      this.index(req, res, e.message);
    }
  },
  alternar(req, res, params) {
    Tarea.alternar(Number(params.get('id')));
    res.writeHead(302, { Location: '/' }).end();
  },
};
