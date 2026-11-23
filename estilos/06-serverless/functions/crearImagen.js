// FUNCIÓN 1 (FaaS): disparada por HTTP. Stateless: no guarda nada en memoria entre invocaciones.
// Firma estilo AWS Lambda: handler(event, context)
exports.handler = async (event, context) => {
  const { nombre } = JSON.parse(event.body || '{}');
  if (!nombre) return { statusCode: 400, body: JSON.stringify({ error: 'nombre requerido' }) };

  // El estado va a servicios gestionados (S3, DynamoDB...), simulados en context.services
  await context.services.storage.put(`uploads/${nombre}`, 'bytes-de-la-imagen');
  return { statusCode: 202, body: JSON.stringify({ mensaje: `${nombre} subida, procesando...` }) };
};
