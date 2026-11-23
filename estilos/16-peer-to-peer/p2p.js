// PEER-TO-PEER: no hay servidor central. Cada nodo (peer) es cliente Y servidor a la vez.
// Los peers se conectan entre sí, comparten archivos y propagan mensajes (gossip).
//
// Ejecutar: node p2p.js   (levanta 4 peers en puertos 5501-5504 dentro del mismo proceso, cada uno con su propio servidor TCP)
const net = require('node:net');

class Peer {
  constructor(puerto, archivos) {
    this.puerto = puerto;
    this.archivos = new Map(Object.entries(archivos)); // lo que este peer comparte
    this.vecinos = new Set();
    this.vistos = new Set(); // para no reenviar mensajes en loop
    // ROL SERVIDOR: escucha a otros peers
    this.server = net.createServer((s) => s.on('data', (d) => this.recibir(JSON.parse(d), s))).listen(puerto, '127.0.0.1');
  }
  log(...a) {
    console.log(`[peer ${this.puerto}]`, ...a);
  }
  conectar(otroPuerto) {
    this.vecinos.add(otroPuerto);
  }
  // ROL CLIENTE: envía a otro peer
  enviar(puerto, msg) {
    return new Promise((ok) => {
      const s = net.connect(puerto, '127.0.0.1', () => s.write(JSON.stringify(msg)));
      s.on('data', (d) => {
        ok(JSON.parse(d));
        s.end();
      });
      s.on('error', () => ok(null));
    });
  }
  recibir(msg, socket) {
    if (msg.tipo === 'BUSCAR') {
      // Flooding / gossip con TTL: si no lo tengo, pregunto a mis vecinos
      if (this.vistos.has(msg.id) || msg.ttl <= 0) return socket.end(JSON.stringify({ encontrado: false }));
      this.vistos.add(msg.id);
      if (this.archivos.has(msg.archivo)) {
        this.log(`tengo "${msg.archivo}", se lo envío directo`);
        return socket.end(JSON.stringify({ encontrado: true, en: this.puerto, contenido: this.archivos.get(msg.archivo) }));
      }
      this.buscarEnVecinos({ ...msg, ttl: msg.ttl - 1 }).then((r) => socket.end(JSON.stringify(r)));
    }
  }
  async buscarEnVecinos(msg) {
    for (const v of this.vecinos) {
      const r = await this.enviar(v, msg);
      if (r?.encontrado) return r;
    }
    return { encontrado: false };
  }
  async buscar(archivo) {
    this.log(`buscando "${archivo}" en la red...`);
    const id = `${this.puerto}-${Date.now()}`;
    this.vistos.add(id);
    const r = await this.buscarEnVecinos({ tipo: 'BUSCAR', id, archivo, ttl: 4 });
    if (r.encontrado) this.archivos.set(archivo, r.contenido); // ahora YO también lo comparto
    this.log(r.encontrado ? `✅ "${archivo}" descargado desde peer ${r.en}` : `❌ "${archivo}" no existe en la red`);
  }
}

// Topología:  5501 ─ 5502 ─ 5503 ─ 5504   (nadie es central)
const peers = [
  new Peer(5501, { 'receta.txt': 'Mezclar harina...' }),
  new Peer(5502, {}),
  new Peer(5503, { 'musica.mp3': '♪♫♪' }),
  new Peer(5504, { 'pelicula.mkv': '🎬...' }),
];
const enlazar = (a, b) => (peers[a].conectar(peers[b].puerto), peers[b].conectar(peers[a].puerto));
enlazar(0, 1);
enlazar(1, 2);
enlazar(2, 3);

(async () => {
  await peers[0].buscar('pelicula.mkv'); // 5501 → 5502 → 5503 → 5504
  await peers[3].buscar('receta.txt'); // en sentido contrario
  await peers[1].buscar('inexistente.zip');
  peers.forEach((p) => p.server.close());
})();
