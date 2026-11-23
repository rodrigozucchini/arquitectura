# 01 · Stateless (Sin Estado)

El servidor **no recuerda nada** del cliente entre una petición y otra. Cada request es **autocontenida**: trae todo lo necesario (token, parámetros) o el estado vive en un **almacén externo** (DB, Redis), nunca en la memoria del proceso.

```
            ┌─► [Instancia A] ─┐
[Cliente] ─►LB─► [Instancia B] ─┼─► (estado externo: DB / Redis, opcional)
  + token   └─► [Instancia C] ─┘
   cualquiera puede atender cualquier request
```

**Ejemplos:** HTTP/REST (por diseño), APIs con JWT, funciones serverless, servidores web detrás de un load balancer, CDNs.

**Ventajas:**
- Escalado horizontal trivial (agregar/quitar instancias).
- Tolerancia a fallos: si una instancia muere, otra sigue sin perder nada.
- Sin sticky sessions; despliegues sin downtime.
- Más fácil de cachear y razonar.

**Desventajas:**
- Requests más pesadas (el contexto viaja cada vez).
- El estado igual existe: se mueve a la DB/cache (latencia extra).
- Revocar tokens auto-contenidos es difícil.

Ver el contraste en [02-stateful](../02-stateful).

```bash
node stateless.js
```
