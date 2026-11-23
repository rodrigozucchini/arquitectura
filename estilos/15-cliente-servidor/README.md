# 15 · Cliente-Servidor

Dos roles: el **servidor** ofrece recursos/servicios centralizados y el **cliente** los solicita. Es la base de la web (navegador ↔ servidor HTTP), bases de datos, correo, etc.

```
[Cliente A] ─┐
[Cliente B] ─┼──► [ Servidor ] ── recursos
[Cliente C] ─┘
```

- **Cliente ligero (thin):** casi toda la lógica en el servidor.
- **Cliente pesado (thick):** mucha lógica en el cliente (ej. SPA).

**Ventajas:** control y seguridad centralizados, datos consistentes.
**Desventajas:** el servidor es punto único de falla y cuello de botella.

```bash
node servidor.js     # terminal 1
node cliente.js      # terminal 2
```
