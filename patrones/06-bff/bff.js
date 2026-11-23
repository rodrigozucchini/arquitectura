// BFF (Backend For Frontend): un backend ESPECÍFICO para cada tipo de cliente (web, móvil,
// smart TV...). Cada BFF agrega, filtra y adapta las respuestas de los servicios internos
// a lo que SU frontend necesita, evitando over/under-fetching.
//
// Ejecutar: node bff.js
const http = require('node:http');

// ---- Servicios internos (genéricos, no saben de pantallas) ----
const servicioProductos = {
  obtener: async (id) => ({ id, nombre: 'Zapatillas Runner', descripcion: 'Texto larguísimo... '.repeat(20), precio: 120, imagenes: ['hd1.jpg', 'hd2.jpg', 'hd3.jpg', 'thumb.jpg'], specs: { peso: '250g', talle: [38, 39, 40, 41] } }),
};
const servicioReviews = {
  deProducto: async () => [{ autor: 'Ana', estrellas: 5, texto: 'Excelentes' }, { autor: 'Luis', estrellas: 4, texto: 'Muy cómodas' }, { autor: 'Eva', estrellas: 3, texto: 'Normales' }],
};
const servicioStock = { disponible: async () => ({ unidades: 7, sucursales: ['Centro', 'Norte'] }) };

// ---- BFF WEB: pantalla grande, quiere todo ----
async function bffWeb(id) {
  const [p, reviews, stock] = await Promise.all([servicioProductos.obtener(id), servicioReviews.deProducto(id), servicioStock.disponible(id)]);
  return { ...p, reviews, stock, promedio: reviews.reduce((a, r) => a + r.estrellas, 0) / reviews.length };
}

// ---- BFF MÓVIL: poco ancho de banda, quiere lo mínimo ----
async function bffMovil(id) {
  const [p, reviews, stock] = await Promise.all([servicioProductos.obtener(id), servicioReviews.deProducto(id), servicioStock.disponible(id)]);
  return {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    imagen: p.imagenes.at(-1), // solo miniatura
    estrellas: Math.round(reviews.reduce((a, r) => a + r.estrellas, 0) / reviews.length),
    hayStock: stock.unidades > 0,
  };
}

// ---- BFF SMARTWATCH: casi nada ----
async function bffWatch(id) {
  const p = await servicioProductos.obtener(id);
  return { n: p.nombre.slice(0, 12), $: p.precio };
}

const server = http
  .createServer(async (req, res) => {
    const [, cliente, , id] = req.url.split('/'); // /web/productos/1
    const bffs = { web: bffWeb, movil: bffMovil, watch: bffWatch };
    if (!bffs[cliente]) return res.writeHead(404).end();
    res.end(JSON.stringify(await bffs[cliente](Number(id))));
  })
  .listen(3023, async () => {
    for (const c of ['web', 'movil', 'watch']) {
      const body = await (await fetch(`http://localhost:3023/${c}/productos/1`)).text();
      console.log(`\n[BFF ${c}] ${body.length} bytes →`, body.length > 300 ? body.slice(0, 300) + '…' : body);
    }
    server.closeAllConnections();
    server.close();
  });
