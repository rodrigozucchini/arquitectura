# 04 · Microservicios

El sistema se divide en **servicios pequeños, autónomos y desplegables por separado**, cada uno alrededor de una capacidad de negocio, con **su propia base de datos**, comunicándose por la red (HTTP/gRPC/mensajería).

```
            ┌─► [usuarios-service] ── DB usuarios
[Gateway] ──┤
            └─► [pedidos-service]  ── DB pedidos
                      │ HTTP
                      └──► usuarios-service
```

**Características:** despliegue independiente · database-per-service · equipos autónomos · tecnología heterogénea · tolerancia a fallos (timeouts, circuit breakers, retries) · observabilidad (logs, trazas, métricas).

**Ventajas:** escalado independiente, aislamiento de fallos, equipos que no se bloquean.
**Desventajas:** complejidad distribuida (red, latencia, consistencia eventual), DevOps costoso, debugging difícil, transacciones distribuidas (ver [Saga](../../patrones/03-saga)).

> "Si no podés construir un monolito bien modularizado, ¿qué te hace pensar que los microservicios te salvarán?" — Simon Brown

```bash
node start-all.js
curl localhost:4100/usuarios/1
curl -X POST localhost:4100/pedidos -d '{"usuarioId":2,"producto":"Mouse"}'
```
