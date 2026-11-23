# 07 · Sidecar y Service Mesh

**Sidecar:** un contenedor/proceso auxiliar que corre **al lado** de cada servicio (mismo pod) y le agrega funcionalidad transversal sin modificar su código.

**Service Mesh:** la red de todos los sidecars (**data plane**) gobernada por un **control plane** central.

```
         ┌──────── Control Plane (Istio / Linkerd) ────────┐
         │  config: retries, timeouts, mTLS, discovery     │
         └───────────┬─────────────────────┬───────────────┘
   ┌── Pod ──────────┴──┐           ┌──────┴── Pod ───────┐
   │ [tienda]◄►[sidecar]│ ══mTLS══► │[sidecar]◄►[precios] │
   └────────────────────┘           └─────────────────────┘
```

**Lo que aporta el sidecar:** mTLS · reintentos · timeouts · circuit breaking · balanceo · service discovery · métricas · trazas distribuidas · canary/traffic splitting.

**Otros patrones "de pod":** **Ambassador** (proxy hacia afuera), **Adapter** (normaliza la salida, ej. métricas), **Init container**.

**Ventajas:** servicios más simples y políglotas; políticas de red uniformes y centralizadas.
**Desventajas:** latencia extra por salto, consumo de recursos, complejidad operativa alta.

```bash
node mesh.js
```
