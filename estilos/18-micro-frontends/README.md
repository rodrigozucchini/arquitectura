# 18 · Micro-Frontends

Lleva la idea de microservicios al **frontend**: la interfaz se divide en partes verticales por dominio, cada una **desarrollada y desplegada de forma independiente** por un equipo distinto; una **app shell** las compone.

```
┌──────────────── App Shell (layout, routing) ───────────────┐
│ ┌── MF Catálogo (equipo A) ──┐  ┌── MF Carrito (equipo B) ─┐│
│ │  React / Vue / vanilla     │──│  evento carrito:agregar  ││
│ └────────────────────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Técnicas de integración:**
- **Build-time:** paquetes npm (simple, pero re-deploy conjunto).
- **Run-time JS:** Module Federation (Webpack/Vite), single-spa, import maps.
- **Web Components** (este ejemplo).
- **Server-side:** SSI/ESI, Podium, Tailor.
- **iframes** (aislamiento máximo, peor UX).

**Ventajas:** equipos autónomos end-to-end, deploys independientes, migraciones graduales de framework.
**Desventajas:** peso duplicado (varios frameworks), consistencia visual, comunicación entre MFs, complejidad de tooling.

```bash
node server.js   # abrir http://localhost:3025
```
