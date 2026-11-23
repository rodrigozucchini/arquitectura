// FUNCIÓN 2 (FaaS): disparada por un EVENTO de storage (como S3:ObjectCreated).
exports.handler = async (event, context) => {
  for (const record of event.Records) {
    const key = record.s3.object.key;
    await context.services.storage.put(key.replace('uploads/', 'thumbs/'), 'miniatura');
    console.log(`   [λ generarMiniatura] miniatura creada para ${key}`);
  }
};
