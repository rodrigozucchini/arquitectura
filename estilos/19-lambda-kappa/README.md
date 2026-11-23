# 19 · Lambda y Kappa (Arquitecturas de Big Data)

Arquitecturas para procesar **grandes volúmenes de datos** combinando histórico y tiempo real.

### Lambda
```
               ┌─► Batch layer (todo el histórico, preciso, lento) ──► vista batch ─┐
Datos (log) ───┤                                                                    ├─► Serving layer ─► consultas
               └─► Speed layer (solo lo reciente, rápido)          ──► vista RT   ─┘
```
**Pros:** precisión del batch + inmediatez del streaming. **Contras:** **dos códigos** para la misma lógica (batch y stream) que hay que mantener sincronizados.
Herramientas: Hadoop/Spark (batch), Storm/Flink/Spark Streaming (speed), Cassandra/Druid (serving).

### Kappa
```
Datos ─► Log inmutable (Kafka) ─► Job de streaming ─► vista ─► consultas
                 └── replay desde offset 0 para recalcular (job v2)
```
**Pros:** un solo código y un solo pipeline. **Contras:** reprocesar históricos enormes puede ser costoso; requiere retener el log.
Herramientas: Kafka + Kafka Streams/Flink.

**Relacionadas:** Data Lake, Lakehouse (Delta Lake, Iceberg), Data Mesh (datos como producto por dominio).

```bash
node lambda-kappa.js
```
