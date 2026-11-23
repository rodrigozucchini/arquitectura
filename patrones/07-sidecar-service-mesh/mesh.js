// SIDECAR + SERVICE MESH
// SIDECAR: un proceso auxiliar que se despliega JUNTO a cada servicio (mismo pod/host) y
// le agrega capacidades sin tocar su código: TLS/mTLS, reintentos, timeouts, métricas,
// trazas, logging. El servicio solo habla con localhost; el sidecar se encarga de la red.
// SERVICE MESH: el conjunto de todos los sidecars (data plane) + un CONTROL PLANE que los
// configura de forma centralizada (Istio, Linkerd, Consul Connect).
//
// Ejecutar: node mesh.js
const http = require('node:http');

// ======================= CONTROL PLANE =======================
const controlPlane = {
  config: { reintentos: 2, timeoutMs: 300, mtls: true },
  servicios: { precios: 'http://localhost:8202' }, // service discovery
  metricas: [],
};

// ======================= SIDECAR (proxy tipo Envoy) =======================
function crearSidecar(nombreServicio, puertoSidecar) {
  return http
    .createServer(async (req, res) => {
      // El servicio llama a  http://localhost:<sidecar>/<destino>/<path>
      const [, destino, ...resto] = req.url.split('/');
      const base = controlPlane.servicios[destino];
      const { reintentos, timeoutMs, mtls } = controlPlane.config;
      const traceId = req.headers['x-trace-id'] || Math.random().toString(16).slice(2, 10);
      const t0 = Date.now();
      for (let intento = 0; intento <= reintentos; intento++) {
        try {
          const r = await fetch(`${base}/${resto.join('/')}`, {
            headers: { 'x-trace-id': traceId, 'x-mtls-cert': mtls ? `cert-de-${nombreServicio}` : '' },
            signal: AbortSignal.timeout(timeoutMs),
          });
          if (r.status >= 500) throw new Error(`HTTP ${r.status}`);
          controlPlane.metricas.push({ origen: nombreServicio, destino, ms: Date.now() - t0, intentos: intento + 1, traceId });
          return res.end(await r.text());
        } catch (e) {
          console.log(`   [sidecar ${nombreServicio}] intento ${intento + 1} falló (${e.message})`);
        }
      }
      res.writeHead(503).end('{"error":"destino no disponible"}');
    })
    .listen(puertoSidecar);
}

// ======================= SERVICIO "precios" (inestable) =======================
let llamadas = 0;
const precios = http
  .createServer((req, res) => {
    if (req.headers['x-mtls-cert'] === '') return res.writeHead(403).end(); // exige mTLS
    llamadas++;
    if (llamadas % 3 === 1) return res.writeHead(500).end(); // falla 1 de cada 3
    res.end(JSON.stringify({ producto: req.url.slice(1), precio: 99 }));
  })
  .listen(8202);

// ======================= SERVICIO "tienda" =======================
// Su código es SIMPLE: no tiene reintentos, ni TLS, ni métricas. Solo llama a su sidecar.
const sidecarTienda = crearSidecar('tienda', 8101);
async function servicioTienda(producto) {
  const r = await fetch(`http://localhost:8101/precios/${producto}`);
  return r.text();
}

(async () => {
  for (const p of ['remera', 'gorra', 'buzo']) console.log(`tienda obtiene ${p}:`, await servicioTienda(p));
  console.log('\n📊 Métricas recolectadas por el mesh (sin tocar el código de los servicios):');
  console.table(controlPlane.metricas);
  for (const s of [precios, sidecarTienda]) (s.closeAllConnections(), s.close());
})();
