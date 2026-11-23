# 07 · Arquitectura en Capas (Layered / N-Tier)

El sistema se organiza en **capas horizontales**; cada capa solo depende de la de **abajo**.

```
 Presentación   (UI, API, consola)
      ↓
 Negocio        (reglas, servicios)
      ↓
 Datos          (repositorios, DB)
```

- **Layered** = separación lógica en el código.
- **N-Tier** = además, cada capa corre en una máquina/proceso distinto (ej. 3-tier: navegador → servidor de aplicación → servidor de BD).
- **Capas cerradas** (no se saltan) vs **abiertas** (se puede saltar una).

**Ventajas:** muy conocida, fácil de entender, separa responsabilidades.
**Desventajas:** el negocio suele depender de la BD (acoplamiento hacia abajo); cambios cruzan todas las capas; tiende al "anemic domain".
**Cuándo:** aplicaciones empresariales CRUD clásicas.

```bash
node presentacion/consola.js
```
