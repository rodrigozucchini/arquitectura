# 05 · API Gateway

Un **único punto de entrada** para todos los clientes, delante de los servicios internos. Centraliza lo transversal para que cada servicio no lo reimplemente.

```
                ┌──────────── API GATEWAY ────────────┐
Clientes ─────► │ auth · rate limit · routing · cache │ ─► Catálogo
                │ logging · circuit breaker · agreg.  │ ─► Inventario
                └─────────────────────────────────────┘ ─► Usuarios
```

**Responsabilidades típicas:** autenticación/autorización · rate limiting / throttling · enrutamiento y versionado · caché · agregación de respuestas · transformación de protocolos (REST ↔ gRPC) · circuit breaker · TLS · observabilidad.

**Productos:** Kong, NGINX, AWS API Gateway, Azure APIM, Apigee, Traefik, Envoy, Spring Cloud Gateway.

**API Gateway vs BFF:** el gateway es uno solo y genérico; un BFF es un gateway especializado por tipo de cliente (se pueden combinar).

**Ventajas:** simplifica clientes, seguridad centralizada, oculta topología interna.
**Desventajas:** punto único de falla y de latencia; riesgo de meter lógica de negocio en el gateway.

```bash
node gateway.js
```
