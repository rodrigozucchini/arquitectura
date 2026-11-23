# 02 · Monolito Modular

Un **único despliegue**, pero el código está dividido en **módulos independientes** (normalmente por dominio de negocio: usuarios, pedidos, pagos). Cada módulo:

- tiene sus **datos privados**,
- expone una **API pública** (contrato),
- se comunica con otros por esa API o por **eventos internos**.

```
┌──────────── Proceso único ────────────┐
│ [Usuarios] ←API─ [Pedidos] ─evento→ [Pagos] │
│   datos         datos          datos  │
└───────────────────────────────────────┘
```

**Ventajas:** simplicidad operativa del monolito + orden de los microservicios; fácil migrar después.
**Desventajas:** requiere disciplina (nada impide en runtime que alguien importe internos); sigue escalando como uno.
**Cuándo usarlo:** casi siempre es el mejor punto de partida (Shopify, por ejemplo, lo usa).

```bash
node main.js
```
