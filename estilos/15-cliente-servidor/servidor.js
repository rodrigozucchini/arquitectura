// SERVIDOR: centraliza recursos y atiende peticiones de muchos clientes.
// Protocolo propio sobre TCP: el cliente envía una línea "COMANDO arg" y recibe respuesta.
// Ejecutar: node servidor.js   (y en otra terminal: node cliente.js)
const net = require('node:net');

const notas = [];

const server = net.createServer((socket) => {
  console.log('Cliente conectado:', socket.remoteAddress, socket.remotePort);
  socket.on('data', (buf) => {
    const [cmd, ...resto] = buf.toString().trim().split(' ');
    if (cmd === 'AGREGAR') {
      notas.push(resto.join(' '));
      socket.write('OK\n');
    } else if (cmd === 'LISTAR') {
      socket.write(JSON.stringify(notas) + '\n');
    } else {
      socket.write('ERROR comando desconocido\n');
    }
  });
});

server.listen(4000, () => console.log('Servidor TCP en puerto 4000'));
