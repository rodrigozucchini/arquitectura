// STATEFUL (con estado): el servidor GUARDA en su memoria el estado de cada cliente
// (sesión, conexión, progreso) y lo usa en las siguientes interacciones.
//
// Ejecutar: node stateful.js
// Parte 1: sesiones HTTP en memoria + el problema al escalar (y la solución: sticky sessions)
// Parte 2: un servidor naturalmente stateful (chat por conexión TCP persistente)
const http = require('node:http');
const net = require('node:net');
const crypto = require('node:crypto');

// ================== PARTE 1: sesiones en memoria ==================
function crearInstancia(id, puerto) {
  const sesiones = new Map(); // ⚠️ ESTADO EN MEMORIA DEL PROCESO
  return http
    .createServer((req, res) => {
      const url = new URL(req.url, 'http://x');
      const sid = (req.headers.cookie || '').match(/sid=(\w+)/)?.[1];
      if (url.pathname === '/login') {
        const nuevo = crypto.randomBytes(8).toString('hex');
        sesiones.set(nuevo, { usuario: url.searchParams.get('u'), carrito: [] });
        res.setHeader('Set-Cookie', `sid=${nuevo}`);
        return res.end(JSON.stringify({ instancia: id, sid: nuevo }));
      }
      const sesion = sesiones.get(sid);
      if (!sesion) return res.end(JSON.stringify({ instancia: id, error: 'sesión desconocida en esta instancia 😱' }));
      sesion.carrito.push(url.searchParams.get('item'));
      res.end(JSON.stringify({ instancia: id, carrito: sesion.carrito }));
    })
    .listen(puerto);
}
const servidores = [crearInstancia('A', 6101), crearInstancia('B', 6102)];

async function demo(nombre, elegirPuerto) {
  console.log(`\n--- ${nombre} ---`);
  let n = 0;
  const pedir = async (path, sid) => {
    const r = await fetch(`http://localhost:${elegirPuerto(n++, sid)}${path}`, { headers: sid ? { cookie: `sid=${sid}` } : {} });
    return r.json();
  };
  const { sid, instancia } = await pedir('/login?u=ana');
  console.log(`login → ${instancia}`);
  for (const item of ['manzana', 'pan', 'leche']) console.log(`agregar ${item}:`, JSON.stringify(await pedir(`/agregar?item=${item}`, sid)));
}

// ================== PARTE 2: conexión persistente (chat) ==================
function chat() {
  return new Promise((fin) => {
    console.log('\n--- Servidor de chat stateful (conexiones TCP) ---');
    const conectados = new Map(); // socket → { nick, mensajes }  (estado por conexión)
    const server = net.createServer((s) => {
      conectados.set(s, { nick: null, mensajes: 0 });
      s.on('data', (d) => {
        const estado = conectados.get(s);
        const txt = d.toString().trim();
        if (!estado.nick) {
          estado.nick = txt; // el servidor RECUERDA quién sos en esta conexión
          return s.write(`hola ${txt}, hay ${conectados.size} conectados\n`);
        }
        estado.mensajes++;
        for (const [otro] of conectados) if (otro !== s) otro.write(`${estado.nick}: ${txt}\n`);
        s.write(`(enviado, llevás ${estado.mensajes} mensajes)\n`);
      });
      s.on('close', () => conectados.delete(s));
    });
    server.listen(6200, async () => {
      const cliente = (nick) =>
        new Promise((ok) => {
          const c = net.connect(6200, () => c.write(nick));
          c.on('data', (d) => d.toString().trim().split('\n').forEach((l) => console.log(`  [${nick} recibe] ${l}`)));
          setTimeout(() => ok(c), 50);
        });
      const ana = await cliente('ana');
      const luis = await cliente('luis');
      ana.write('¿cómo va?');
      await new Promise((r) => setTimeout(r, 50));
      luis.write('¡bien!');
      await new Promise((r) => setTimeout(r, 50));
      ana.end();
      luis.end();
      server.close(fin);
    });
  });
}

(async () => {
  // Sin afinidad: el balanceador alterna instancias y la sesión "se pierde"
  await demo('Round robin SIN sticky sessions (se rompe)', (n) => 6101 + (n % 2));
  // Con sticky sessions: el balanceador manda siempre al mismo servidor según la cookie
  const afinidad = new Map();
  let puertoLogin;
  await demo('CON sticky sessions (funciona, pero acopla cliente↔instancia)', (n, sid) => {
    if (!sid) return (puertoLogin = 6101 + (n % 2));
    if (!afinidad.has(sid)) afinidad.set(sid, puertoLogin); // fija la sesión a la instancia que la creó
    return afinidad.get(sid);
  });
  servidores.forEach((s) => (s.closeAllConnections(), s.close()));
  await chat();
})();
