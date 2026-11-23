# 14 · Space-Based Architecture

Pensada para **picos de carga extremos e impredecibles** (venta de entradas, subastas, Black Friday). Quita la base de datos del camino crítico: los datos viven **en memoria replicada** dentro de cada unidad de procesamiento.

```
               ┌──────── Virtualized Middleware ────────┐
 Peticiones ─► │ messaging grid · data grid · deployment│
               └───┬───────────┬───────────┬────────────┘
                [PU-1]      [PU-2]      [PU-3]   ← cada una con cache en memoria
                   └─── replicación ───┘
                          │ data pump (asíncrono)
                          ▼
                       [ DB ]
```

**Componentes:** Processing Units · Data Grid (Hazelcast, Apache Ignite, Redis) · Messaging Grid · Deployment Manager · Data Pumps/Writers/Readers.

**Ventajas:** escalabilidad casi lineal, alta elasticidad, latencia muy baja.
**Desventajas:** complejidad, colisiones de datos entre réplicas, costoso (mucha RAM), difícil de testear con carga real.

```bash
node space-based.js
```
