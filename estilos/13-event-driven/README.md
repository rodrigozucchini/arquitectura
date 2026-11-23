# 13 · Event-Driven Architecture (Orientada a Eventos)

Los componentes se comunican mediante **eventos** (hechos que ya ocurrieron: `OrdenCreada`, `PagoAprobado`). Los productores publican en un **broker** y los consumidores se suscriben, **sin conocerse entre sí**.

```
[Órdenes] ──OrdenCreada──► (Broker / Kafka / RabbitMQ)
                              ├──► [Inventario] ──StockReservado──► [Envíos]
                              ├──► [Email]
                              └──► [Analytics]
```

**Topologías:**
- **Broker (coreografía):** sin coordinador central; cada servicio reacciona y emite nuevos eventos.
- **Mediator (orquestación):** un mediador dirige el flujo paso a paso.

**Conceptos:** pub/sub, colas, topics, at-least-once, idempotencia, dead-letter queue, consistencia eventual.

**Ventajas:** desacoplamiento extremo, escalabilidad, fácil agregar consumidores, tiempo real.
**Desventajas:** flujo difícil de seguir y depurar, orden de eventos, duplicados, consistencia eventual.

```bash
node event-driven.js
```
