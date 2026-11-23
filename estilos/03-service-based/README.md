# 03 · Service-Based Architecture

Estilo descrito por Mark Richards y Neal Ford. Está **entre el monolito y los microservicios**: pocos **servicios de dominio grandes** (normalmente 4 a 12), cada uno **desplegado por separado**, que **comparten una misma base de datos**.

```
              [ UI / API Gateway ]
         ┌──────────┼───────────┐
    [Clientes]   [Ventas]    [Reportes]     ← servicios de grano grueso,
         │     (pedidos +        │             procesos independientes
         │      facturación)     │
         └──────────┼───────────┘
              ( DB COMPARTIDA )
```

| | Monolito | Service-Based | Microservicios |
|---|---|---|---|
| Unidades de despliegue | 1 | Pocas (4-12) | Muchas (decenas o cientos) |
| Tamaño del servicio | — | Un dominio entero | Una capacidad chica |
| Base de datos | Una | **Compartida** (o pocas) | Una por servicio |
| Transacciones | ACID | **ACID** dentro de un servicio | Saga, consistencia eventual |
| Comunicación entre servicios | En memoria | Poca; casi todo va por la DB | Mucha, por red |

**Ventajas:** despliegue y escalado independientes sin la complejidad de los microservicios; transacciones ACID; reportes con joins simples; muy pragmático para migrar un monolito.
**Desventajas:** la DB compartida acopla a los servicios (un cambio de esquema puede romper a otros); la DB puede ser un cuello de botella; escala menos fino que los microservicios.
**Cuándo:** sistemas empresariales medianos, migración gradual de un monolito, equipos que necesitan desplegar por separado pero no quieren datos distribuidos.

```bash
node start-all.js
```
