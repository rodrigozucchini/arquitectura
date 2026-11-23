// MICRO-FRONTENDS: la idea de microservicios aplicada al FRONTEND. La UI se divide en
// piezas independientes (por dominio), cada una desarrollada y desplegada por un equipo
// distinto, y una aplicación "shell/contenedor" las compone en el navegador.
//
// Ejecutar: node server.js → http://localhost:3025
// Cada micro-frontend se sirve desde un "servidor" (origen) distinto, como en producción.
const http = require('node:http');

// ---- Micro-frontend 1: equipo CATÁLOGO (Web Component, vanilla JS) ----
const mfCatalogo = `
class MfCatalogo extends HTMLElement {
  connectedCallback() {
    const productos = [{ id: 1, n: 'Café', p: 5 }, { id: 2, n: 'Té', p: 3 }, { id: 3, n: 'Mate', p: 4 }];
    this.innerHTML = '<h3 style="color:#2a7">🛍️ Catálogo (equipo A, puerto 3026)</h3>' +
      productos.map(x => '<button data-id="'+x.id+'">'+x.n+' $'+x.p+'</button>').join(' ');
    this.querySelectorAll('button').forEach(b => b.onclick = () => {
      const pr = productos.find(x => x.id == b.dataset.id);
      // Comunicación entre micro-frontends: eventos del navegador (sin acoplarse)
      window.dispatchEvent(new CustomEvent('carrito:agregar', { detail: pr }));
    });
  }
}
customElements.define('mf-catalogo', MfCatalogo);`;

// ---- Micro-frontend 2: equipo CHECKOUT (otro equipo, otro deploy) ----
const mfCarrito = `
class MfCarrito extends HTMLElement {
  connectedCallback() {
    this.items = [];
    this.render();
    window.addEventListener('carrito:agregar', e => { this.items.push(e.detail); this.render(); });
  }
  render() {
    const total = this.items.reduce((a, x) => a + x.p, 0);
    this.innerHTML = '<h3 style="color:#a52">🛒 Carrito (equipo B, puerto 3027)</h3>' +
      '<p>' + (this.items.map(x => x.n).join(', ') || 'vacío') + '</p><b>Total: $' + total + '</b>';
  }
}
customElements.define('mf-carrito', MfCarrito);`;

// ---- App SHELL (contenedor): layout, navegación y composición ----
const shell = `<!doctype html><html><head><meta charset="utf-8"><title>Micro-frontends</title>
<style>body{font-family:sans-serif;max-width:800px;margin:auto;padding:16px}
section{border:2px dashed #999;padding:12px;margin:12px 0;border-radius:8px}</style></head>
<body>
  <h1>🏠 Shell (equipo plataforma)</h1>
  <section><mf-catalogo></mf-catalogo></section>
  <section><mf-carrito></mf-carrito></section>
  <!-- Integración en runtime: cada MF se carga desde SU propio origen -->
  <script src="http://localhost:3026/catalogo.js"></script>
  <script src="http://localhost:3027/carrito.js"></script>
</body></html>`;

const servir = (puerto, tipo, contenido, nombre) =>
  http
    .createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': tipo, 'Access-Control-Allow-Origin': '*' });
      res.end(contenido);
    })
    .listen(puerto, () => console.log(`${nombre.padEnd(14)} → http://localhost:${puerto}`));

servir(3025, 'text/html; charset=utf-8', shell, 'Shell');
servir(3026, 'text/javascript; charset=utf-8', mfCatalogo, 'MF Catálogo');
servir(3027, 'text/javascript; charset=utf-8', mfCarrito, 'MF Carrito');
