// CAPA 3 · INTERFACE ADAPTERS (Controllers, Presenters, Gateways)
// Convierten datos entre el formato de los casos de uso y el de frameworks/DB/UI.

// Controller: traduce la entrada (ej. request HTTP) al Input DTO del caso de uso
class UsuarioController {
  constructor(registrarUsuario) {
    this.registrar = registrarUsuario;
  }
  async post(body) {
    await this.registrar.ejecutar({ email: body.email, nombre: body.nombre });
  }
}

// Presenter: traduce el Output DTO a un ViewModel (aquí: respuesta HTTP)
class JsonPresenter {
  presentar(salida) {
    this.viewModel = { status: salida.ok ? 201 : 400, body: salida };
  }
}

// Gateway: implementa la interfaz que pidió el caso de uso usando un "driver" de DB
class UsuarioGatewaySQL {
  constructor(db) {
    this.db = db;
  }
  async existeEmail(email) {
    return (await this.db.query('SELECT * FROM usuarios WHERE email = ?', [String(email ?? '').toLowerCase()])).length > 0;
  }
  async siguienteId() {
    return (await this.db.query('SELECT COUNT(*)')).length + 1;
  }
  async guardar(u) {
    await this.db.query('INSERT INTO usuarios VALUES (?, ?, ?)', [u.id, u.email, u.nombre]);
  }
}

module.exports = { UsuarioController, JsonPresenter, UsuarioGatewaySQL };
