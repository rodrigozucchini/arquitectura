# 08 · Arquitectura Hexagonal (Puertos y Adaptadores)

Propuesta por Alistair Cockburn. El **dominio** está en el centro y no depende de nada externo. Se comunica con el mundo a través de **puertos** (interfaces) que implementan **adaptadores** (tecnología concreta).

```
        HTTP ─┐                    ┌─ Repo memoria
         CLI ─┤► [Puerto entrada]  │
   (driving)  │   ┌──────────┐     ├─ Repo archivo / SQL
              └──►│ DOMINIO  │──► [Puerto salida]
                  └──────────┘     └─ Notificador email
                                     (driven)
```

- **Puertos de entrada (driving/primarios):** casos de uso que el exterior invoca.
- **Puertos de salida (driven/secundarios):** lo que el dominio necesita (persistencia, mensajería).
- Las dependencias **apuntan hacia el dominio** (inversión de dependencias).

**Ventajas:** el dominio se testea sin infraestructura; cambiar DB/framework no toca el negocio.
**Desventajas:** más archivos e indirección; exagerado para CRUDs simples.

```bash
node main.js cli A B 30
node main.js http   # http://localhost:3006/?de=A&a=B&monto=10
```
