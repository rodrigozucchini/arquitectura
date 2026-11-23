# 06 · BFF (Backend For Frontend)

Patrón popularizado por SoundCloud/Netflix: **un backend por cada tipo de frontend**. Cada BFF lo mantiene normalmente el mismo equipo del frontend.

```
[App Web]    ─► [BFF Web]    ─┐
[App Móvil]  ─► [BFF Móvil]  ─┼─► Productos · Reviews · Stock (servicios internos)
[Smartwatch] ─► [BFF Watch]  ─┘
```

**Qué hace un BFF:** agrega llamadas a varios servicios, recorta/adapta campos, formatea para la UI, maneja auth específica del cliente.

**Ventajas:** cada UI recibe exactamente lo que necesita; los frontends evolucionan independientes; menos lógica en el cliente.
**Desventajas:** duplicación de código entre BFFs; más servicios que mantener.
**Alternativa:** GraphQL (un solo endpoint donde el cliente elige los campos).

```bash
node bff.js
```
