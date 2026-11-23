// DOMINIO (el centro del hexágono): lógica pura, sin dependencias de frameworks, DB ni HTTP.
class Cuenta {
  constructor(id, saldo = 0) {
    this.id = id;
    this.saldo = saldo;
  }
  depositar(monto) {
    if (monto <= 0) throw new Error('Monto inválido');
    this.saldo += monto;
  }
  retirar(monto) {
    if (monto <= 0) throw new Error('Monto inválido');
    if (monto > this.saldo) throw new Error('Saldo insuficiente');
    this.saldo -= monto;
  }
}

// Servicio de aplicación: implementa el PUERTO DE ENTRADA y usa PUERTOS DE SALIDA.
class ServicioTransferencias {
  /** @param {{repo: import('../puertos/puertos').CuentaRepositorio, notificador: import('../puertos/puertos').Notificador}} deps */
  constructor({ repo, notificador }) {
    this.repo = repo;
    this.notificador = notificador;
  }
  async transferir(origenId, destinoId, monto) {
    const origen = await this.repo.obtener(origenId);
    const destino = await this.repo.obtener(destinoId);
    origen.retirar(monto);
    destino.depositar(monto);
    await this.repo.guardar(origen);
    await this.repo.guardar(destino);
    await this.notificador.notificar(`Transferidos $${monto} de ${origenId} a ${destinoId}`);
  }
}

module.exports = { Cuenta, ServicioTransferencias };
