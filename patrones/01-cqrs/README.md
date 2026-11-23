# 01 · CQRS (Command Query Responsibility Segregation)

Separa **escritura** (Commands) de **lectura** (Queries) en modelos distintos, que pueden incluso usar bases de datos distintas (ej. PostgreSQL para escribir, Elasticsearch/Redis para leer).

```
           Command ──► [Write Model] ──► Write DB
                              │ eventos
                              ▼
 UI ◄── Query ◄── [Read Model / Proyecciones] ◄── Read DB
```

- **Command:** intención de cambiar algo (`CrearProducto`). Valida reglas. No devuelve datos.
- **Query:** pide datos. No modifica nada. Lee vistas ya preparadas.

**Ventajas:** escalar lecturas y escrituras por separado; vistas ultra rápidas; modelos más simples.
**Desventajas:** consistencia eventual; más infraestructura; overkill en CRUD simple.
Suele combinarse con **Event Sourcing** ([patrones/02-event-sourcing](../02-event-sourcing)).

```bash
node cqrs.js
```
