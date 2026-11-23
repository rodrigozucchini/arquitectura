# 02 · Event Sourcing

En lugar de guardar el **estado actual** (`saldo = 120`), se guarda **cada evento** que ocurrió (`Abierta`, `Depositó 100`, `Depositó 50`, `Retiró 30`). El estado se obtiene **reproduciendo** los eventos.

```
Event Store (append-only)
 v1 CuentaAbierta ─┐
 v2 Depositado 100 ├──► replay ──► Estado actual (saldo 120)
 v3 Depositado 50  │
 v4 Retirado 30   ─┘
```

**Conceptos:** event store · stream por agregado · replay · snapshots (para no reproducir millones de eventos) · proyecciones · concurrencia optimista por versión · eventos inmutables.

**Ventajas:** auditoría completa, viaje en el tiempo, depurar reproduciendo, nuevas proyecciones a partir del histórico.
**Desventajas:** evolución del esquema de eventos (versionado), complejidad, consultas requieren proyecciones (→ CQRS).
**Ejemplos reales:** contabilidad, banca, Git (¡commits son eventos!), EventStoreDB.

```bash
node event-sourcing.js
```
