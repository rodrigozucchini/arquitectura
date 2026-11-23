# 01 · Monolito

Toda la aplicación (API, lógica de negocio y acceso a datos) está en **un solo código, un solo proceso y un solo despliegue**.

```
┌──────────────────────────────┐
│          MONOLITO            │
│  HTTP ─ Usuarios ─ Pedidos   │
│        └──── DB única ─────┘ │
└──────────────────────────────┘
```

**Ventajas:** simple de desarrollar, probar y desplegar; llamadas en memoria (rápidas); transacciones fáciles.
**Desventajas:** escala como un todo; un bug puede tumbar todo; con el tiempo se vuelve una "gran bola de barro"; equipos grandes se pisan.
**Cuándo usarlo:** MVPs, startups, equipos chicos, dominio todavía incierto.

```bash
node app.js
curl -X POST localhost:3001/usuarios -d '{"nombre":"Ana"}'
curl -X POST localhost:3001/pedidos -d '{"usuarioId":1,"producto":"Libro","total":20}'
```
