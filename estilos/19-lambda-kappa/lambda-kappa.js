// ARQUITECTURAS DE BIG DATA: LAMBDA y KAPPA
//
// LAMBDA (Nathan Marz): tres capas
//   - Batch layer: recalcula vistas PRECISAS sobre TODO el histórico (lento, ej. Spark/Hadoop)
//   - Speed layer: procesa en tiempo real solo lo reciente (rápido, aproximado, ej. Flink/Storm)
//   - Serving layer: combina ambas vistas para responder consultas
//
// KAPPA (Jay Kreps): una sola capa de STREAMING. El histórico es un log inmutable
//   (ej. Kafka); para recalcular se "rebobina" el log y se reprocesa con el mismo código.
//
// Ejecutar: node lambda-kappa.js

// Log de eventos de clicks (fuente de verdad inmutable, como un topic de Kafka)
const log = [];
const evento = (pagina) => log.push({ offset: log.length, pagina, ts: Date.now() });
['home', 'home', 'producto', 'home', 'carrito', 'producto'].forEach(evento);

// =========================== LAMBDA ===========================
console.log('==== LAMBDA ====');
const lambda = { vistaBatch: {}, vistaSpeed: {}, ultimoOffsetBatch: -1 };

function batchLayer() {
  // Recalcula TODO desde cero (idempotente y preciso)
  lambda.vistaBatch = {};
  for (const e of log) lambda.vistaBatch[e.pagina] = (lambda.vistaBatch[e.pagina] || 0) + 1;
  lambda.ultimoOffsetBatch = log.length - 1;
  lambda.vistaSpeed = {}; // la speed layer se resetea: el batch ya incorporó esos datos
  console.log('  🐢 batch layer recalculó todo:', lambda.vistaBatch);
}
function speedLayer(e) {
  // Incremental, solo lo que el batch todavía no vio
  if (e.offset <= lambda.ultimoOffsetBatch) return;
  lambda.vistaSpeed[e.pagina] = (lambda.vistaSpeed[e.pagina] || 0) + 1;
}
function servingLayer(pagina) {
  return (lambda.vistaBatch[pagina] || 0) + (lambda.vistaSpeed[pagina] || 0);
}

batchLayer(); // corre, por ejemplo, cada noche
['home', 'producto', 'home'].forEach((p) => {
  evento(p);
  speedLayer(log.at(-1)); // llegan eventos nuevos en tiempo real
});
console.log('  ⚡ speed layer (reciente):', lambda.vistaSpeed);
console.log('  🔎 serving: visitas a home =', servingLayer('home'), '| producto =', servingLayer('producto'));

// =========================== KAPPA ===========================
console.log('\n==== KAPPA ====');
// UN solo job de streaming. Su estado + el offset hasta dónde leyó.
function crearJobStreaming(version, transformar) {
  const job = { version, estado: {}, offset: 0 };
  job.procesarPendientes = () => {
    for (; job.offset < log.length; job.offset++) transformar(job.estado, log[job.offset]);
  };
  return job;
}

// v1: cuenta visitas por página
let job = crearJobStreaming('v1', (s, e) => (s[e.pagina] = (s[e.pagina] || 0) + 1));
job.procesarPendientes();
console.log('  ▶ job v1 en tiempo real:', job.estado);

// Cambia el requerimiento: ahora queremos agrupar por "sección".
// En Kappa NO hay batch: se despliega v2 y se REPROCESA el log desde el offset 0.
const seccion = (p) => (p === 'carrito' ? 'checkout' : 'navegacion');
const jobV2 = crearJobStreaming('v2', (s, e) => (s[seccion(e.pagina)] = (s[seccion(e.pagina)] || 0) + 1));
jobV2.procesarPendientes(); // replay de TODO el histórico con el mismo código de streaming
console.log('  ⏪ job v2 reprocesó el log completo:', jobV2.estado);
evento('carrito');
jobV2.procesarPendientes(); // y sigue en tiempo real
console.log('  ▶ job v2 tras un evento nuevo:', jobV2.estado);
job = jobV2; // se cambia el tráfico a v2 y se apaga v1
