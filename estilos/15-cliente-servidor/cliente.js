// CLIENTE: inicia la comunicación y consume los servicios del servidor.
const net = require('node:net');

const pedidos = ['AGREGAR comprar pan', 'AGREGAR estudiar arquitectura', 'LISTAR'];
const socket = net.connect(4000, 'localhost', () => enviarSiguiente());

function enviarSiguiente() {
  const p = pedidos.shift();
  if (!p) return socket.end();
  console.log('> ' + p);
  socket.write(p + '\n');
}

socket.on('data', (d) => {
  console.log('< ' + d.toString().trim());
  enviarSiguiente();
});
