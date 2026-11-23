# 05 · SOA (Arquitectura Orientada a Servicios)

Antecesora de los microservicios (años 2000). Servicios **empresariales, reutilizables y de grano grueso**, conectados por un **ESB (Enterprise Service Bus)** que concentra enrutamiento, transformación de mensajes, orquestación y políticas. Típicamente con SOAP/WSDL/XML.

```
[CRM legacy XML]   [Facturación JSON]   [Inventario]
        └──────────┬───────┴──────────────┘
             ═══ ESB (routing, transformación, orquestación) ═══
                        │
                  Aplicaciones
```

| | SOA | Microservicios |
|---|---|---|
| Alcance | Empresa entera | Una aplicación |
| Comunicación | ESB "inteligente" | "Smart endpoints, dumb pipes" |
| Datos | A menudo compartidos | Uno por servicio |
| Grano | Grueso | Fino |

**Ventajas:** integra sistemas heterogéneos/legacy, reutilización.
**Desventajas:** el ESB se vuelve cuello de botella y punto único de falla; gobernanza pesada.

```bash
node soa.js
```
