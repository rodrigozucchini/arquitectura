# 06 · Serverless (FaaS + BaaS)

No administrás servidores: escribís **funciones** que el proveedor ejecuta **bajo demanda** ante eventos (HTTP, colas, archivos, cron). Escala automáticamente (incluso a cero) y se paga por invocación.

```
HTTP ─► API Gateway ─► λ crearImagen ─► S3 (uploads/)
                                          │ evento ObjectCreated
                                          ▼
                                   λ generarMiniatura ─► S3 (thumbs/)
```

- **FaaS:** Functions as a Service (AWS Lambda, Azure Functions, Google Cloud Functions, Cloudflare Workers).
- **BaaS:** Backend as a Service (DynamoDB, S3, Firebase, Auth0).
- Las funciones son **stateless** y efímeras: el estado va a servicios externos.

**Ventajas:** cero operación de servidores, escalado automático, pago por uso.
**Desventajas:** cold starts, límites de tiempo/memoria, vendor lock-in, difícil de probar localmente, costos altos con carga constante.

```bash
node local-runtime.js
curl -X POST localhost:3014/imagenes -d '{"nombre":"gato.png"}'
curl localhost:3014/metricas
```
