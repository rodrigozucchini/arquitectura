// CAPA 2 · USE CASES (Application Business Rules)
// Orquesta entidades para cumplir un caso de uso. Depende SOLO de Entities y de
// interfaces (gateways) que ella misma define; las implementaciones vienen de afuera.
const { Usuario } = require('../entities/Usuario');

class RegistrarUsuario {
  /**
   * @param {{ usuarioGateway: { existeEmail(e:string):Promise<boolean>, guardar(u:Usuario):Promise<void>, siguienteId():Promise<number> },
   *           presenter: { presentar(salida:object):void } }} deps
   */
  constructor({ usuarioGateway, presenter }) {
    this.gw = usuarioGateway;
    this.presenter = presenter;
  }

  // Input DTO → Output DTO (nunca se exponen entidades hacia afuera)
  async ejecutar({ email, nombre }) {
    try {
      if (await this.gw.existeEmail(email)) throw new Error('El email ya está registrado');
      const u = new Usuario({ id: await this.gw.siguienteId(), email, nombre });
      await this.gw.guardar(u);
      this.presenter.presentar({ ok: true, id: u.id, mensaje: `Bienvenido ${u.nombre}` });
    } catch (e) {
      this.presenter.presentar({ ok: false, error: e.message });
    }
  }
}
module.exports = { RegistrarUsuario };
