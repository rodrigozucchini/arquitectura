// LEADER-FOLLOWER (antes "Master-Slave" / Primary-Replica):
// - Un nodo LÍDER acepta las ESCRITURAS y las replica a los SEGUIDORES.
// - Los seguidores atienden LECTURAS (escalado de lectura).
// - Si el líder cae, los seguidores ELIGEN un nuevo líder (failover, estilo Raft simplificado).
//
// Ejecutar: node leader-follower.js

class Nodo {
  constructor(id, cluster) {
    Object.assign(this, { id, cluster, rol: 'seguidor', datos: new Map(), log: [], vivo: true, termino: 0 });
  }
  // ---- Escrituras: solo el líder ----
  escribir(k, v) {
    if (this.rol !== 'lider') throw new Error(`${this.id} no es líder; redirigir a ${this.cluster.lider()?.id}`);
    const entrada = { indice: this.log.length + 1, termino: this.termino, k, v };
    this.log.push(entrada);
    this.datos.set(k, v);
    // Replicación: se confirma cuando la MAYORÍA (quórum) la tiene
    const acks = 1 + this.cluster.seguidores().filter((s) => s.replicar(entrada)).length;
    const quorum = Math.floor(this.cluster.nodos.length / 2) + 1;
    console.log(`  ✍️  ${this.id} escribe ${k}=${v} (acks ${acks}/${this.cluster.nodos.length}, quórum ${quorum}) ${acks >= quorum ? '✅ commit' : '⚠️ sin quórum'}`);
  }
  replicar(entrada) {
    if (!this.vivo) return false;
    this.log.push(entrada);
    this.datos.set(entrada.k, entrada.v);
    return true;
  }
  // ---- Lecturas: cualquier nodo ----
  leer(k) {
    return this.datos.get(k);
  }
}

class Cluster {
  constructor(n) {
    this.nodos = Array.from({ length: n }, (_, i) => new Nodo(`nodo-${i + 1}`, this));
    this.nodos[0].rol = 'lider';
  }
  lider() {
    return this.nodos.find((n) => n.rol === 'lider' && n.vivo);
  }
  seguidores() {
    return this.nodos.filter((n) => n.rol === 'seguidor');
  }
  vivos() {
    return this.nodos.filter((n) => n.vivo);
  }
  // Heartbeat: si no hay líder vivo, se convoca una elección
  verificarSalud() {
    if (this.lider()) return;
    console.log('  💔 no hay heartbeat del líder → elección');
    // Gana el nodo con el log más actualizado (así no se pierden escrituras confirmadas)
    const candidato = this.vivos().sort((a, b) => b.log.length - a.log.length)[0];
    const votos = this.vivos().length;
    if (votos < Math.floor(this.nodos.length / 2) + 1) return console.log('  ❌ no hay mayoría, el cluster queda en solo-lectura');
    this.nodos.forEach((n) => n.rol === 'lider' && (n.rol = 'caido'));
    candidato.rol = 'lider';
    candidato.termino++;
    console.log(`  👑 ${candidato.id} es el nuevo líder (término ${candidato.termino}, ${votos} votos)`);
  }
}

const c = new Cluster(3);
console.log('Líder inicial:', c.lider().id);
c.lider().escribir('usuario:1', 'Ana');
c.lider().escribir('usuario:2', 'Luis');

console.log('\nLecturas balanceadas en seguidores:');
c.seguidores().forEach((s) => console.log(`  📖 ${s.id} lee usuario:1 = ${s.leer('usuario:1')}`));

try {
  c.seguidores()[0].escribir('x', 1);
} catch (e) {
  console.log('\nEscritura en seguidor →', e.message);
}

console.log('\n💥 se cae el líder nodo-1');
c.nodos[0].vivo = false;
c.verificarSalud();
c.lider().escribir('usuario:3', 'Eva');
console.log('  📖 dato viejo sigue disponible:', c.lider().leer('usuario:2'));

console.log('\n💥 se cae otro nodo');
c.seguidores().find((n) => n.vivo).vivo = false;
c.lider().escribir('usuario:4', 'Leo');
