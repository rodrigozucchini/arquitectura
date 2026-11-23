# 03 · Saga (Transacciones Distribuidas)

En microservicios cada servicio tiene su propia BD, así que **no hay transacción ACID global**. Una **saga** es una secuencia de transacciones locales; si un paso falla, se ejecutan **transacciones compensatorias** en orden inverso.

```
Crear pedido ─► Cobrar ─► Reservar stock ─✘ falla
                  ▲           
Cancelar pedido ◄─ Reembolsar ◄─┘   (compensaciones)
```

| Tipo | Cómo | Pros | Contras |
|---|---|---|---|
| **Orquestada** | Un orquestador central dirige los pasos | Flujo visible, fácil de razonar | El orquestador concentra lógica |
| **Coreografiada** | Servicios reaccionan a eventos | Desacoplada, sin punto central | Difícil de seguir, riesgo de ciclos |

**Herramientas:** Temporal, Camunda, AWS Step Functions, Axon, MassTransit.
**Claves:** idempotencia, compensaciones que no fallen, estado de la saga persistido, consistencia eventual. Relacionado: patrón **Outbox** para publicar eventos de forma confiable.

```bash
node saga.js
```
