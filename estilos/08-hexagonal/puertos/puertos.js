// PUERTOS: interfaces que define el DOMINIO. Los adaptadores las implementan.
// (En JS las documentamos con JSDoc; en TS/Java serían `interface`.)

/**
 * PUERTO DE ENTRADA (driving / primario): lo que la app ofrece al mundo.
 * @typedef {Object} TransferirCasoDeUso
 * @property {(origenId: string, destinoId: string, monto: number) => Promise<void>} transferir
 */

/**
 * PUERTO DE SALIDA (driven / secundario): lo que la app necesita del mundo.
 * @typedef {Object} CuentaRepositorio
 * @property {(id: string) => Promise<import('../dominio/cuenta').Cuenta>} obtener
 * @property {(c: import('../dominio/cuenta').Cuenta) => Promise<void>} guardar
 */

/**
 * @typedef {Object} Notificador
 * @property {(msg: string) => Promise<void>} notificar
 */

module.exports = {};
