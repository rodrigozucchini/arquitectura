// PIPES AND FILTERS: el procesamiento se divide en FILTROS independientes (cada uno hace
// una sola transformación) conectados por PIPES (tuberías) por donde fluyen los datos.
// Aquí usamos Node Streams: los datos fluyen en chunks, con backpressure.
//
// Ejecutar: node pipeline.js
const { Readable, Transform, Writable } = require('node:stream');
const { pipeline } = require('node:stream/promises');

// FUENTE (source / pump): genera datos (simula un log de un servidor)
const logs = [
  '2026-11-23 10:00:01 INFO  usuario=ana accion=login',
  '2026-11-23 10:00:05 ERROR usuario=luis accion=pago monto=300',
  '2026-11-23 10:00:09 INFO  usuario=ana accion=compra monto=50',
  'línea corrupta ###',
  '2026-11-23 10:01:00 ERROR usuario=ana accion=pago monto=120',
  '2026-11-23 10:02:30 WARN  usuario=eva accion=login',
];
const fuente = Readable.from(logs);

// FILTRO 1: parsear texto → objeto
const parsear = new Transform({
  objectMode: true,
  transform(linea, _, cb) {
    const m = linea.match(/^(\S+ \S+) (\w+)\s+(.*)$/);
    if (!m) return cb(); // descarta líneas inválidas
    const campos = Object.fromEntries(m[3].split(' ').map((kv) => kv.split('=')));
    cb(null, { fecha: m[1], nivel: m[2], ...campos });
  },
});

// FILTRO 2: quedarse solo con errores
const soloErrores = new Transform({
  objectMode: true,
  transform(ev, _, cb) {
    cb(null, ev.nivel === 'ERROR' ? ev : undefined);
  },
});

// FILTRO 3: enriquecer (ej. agregar severidad)
const enriquecer = new Transform({
  objectMode: true,
  transform(ev, _, cb) {
    cb(null, { ...ev, severidad: Number(ev.monto) > 200 ? 'ALTA' : 'MEDIA' });
  },
});

// SUMIDERO (sink): destino final
const salida = new Writable({
  objectMode: true,
  write(ev, _, cb) {
    console.log('🚨', JSON.stringify(ev));
    cb();
  },
});

// PIPE: el orden de los filtros es configurable y cada uno es reutilizable
pipeline(fuente, parsear, soloErrores, enriquecer, salida).then(() => console.log('Pipeline terminado'));

// Equivalente en Unix (¡el ejemplo clásico de pipes and filters!):
//   cat app.log | grep ERROR | awk '{print $4}' | sort | uniq -c
