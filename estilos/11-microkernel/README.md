# 11 · Microkernel (Arquitectura de Plugins)

Un **núcleo mínimo y estable** + **plugins** que agregan funcionalidad a través de puntos de extensión definidos por el núcleo. Los plugins son independientes entre sí.

```
        ┌────────┐ ┌────────┐ ┌──────────┐
        │Plugin A│ │Plugin B│ │ Plugin C │
        └───┬────┘ └───┬────┘ └────┬─────┘
            └──── API / hooks ─────┘
               ┌──────────────┐
               │  NÚCLEO      │
               └──────────────┘
```

**Ejemplos reales:** VS Code (extensiones), Eclipse, navegadores, WordPress, Webpack/Babel/ESLint, el kernel de un SO (en el sentido de diseño de SO, microkernel = mínimo en modo kernel, drivers como servicios).

**Ventajas:** extensibilidad, personalización, el núcleo cambia poco, plugins desarrollados por terceros.
**Desventajas:** diseñar bien el contrato del plugin es difícil; versionar la API; plugins pueden romper la estabilidad.

Probá borrar o agregar un archivo en `plugins/` y volvé a correr:

```bash
node core.js
```
