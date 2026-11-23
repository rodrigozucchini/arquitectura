# 02 · Stateful (Con Estado)

El servidor **recuerda** información del cliente entre interacciones: sesiones en memoria, conexiones abiertas, progreso de una partida, posición de un stream.

```
[Cliente ana] ──sid=abc──► [Instancia A]  sesiones: { abc: carrito[...] }
                       ✗──► [Instancia B]  sesiones: { }   ← "¿quién sos?"
```

**Ejemplos:** sesiones de servidor clásicas (PHP/Java EE), WebSockets y chats, servidores de juegos multijugador, bases de datos, FTP, conexiones TCP, actores ([patrones/10-actor-model](../../patrones/10-actor-model)), Kafka consumers con offset.

**Ventajas:**
- Requests livianas (el contexto ya está en el servidor).
- Muy baja latencia (estado en memoria, sin ir a la DB).
- Natural para tiempo real y conexiones largas.

**Desventajas:**
- Escalar es difícil: hace falta **sticky sessions**, replicación de sesiones o un store compartido.
- Si la instancia muere, se pierde el estado (salvo replicación/persistencia).
- Despliegues más complicados (drenar conexiones).

### Stateless vs Stateful

| | Stateless | Stateful |
|---|---|---|
| Dónde está el estado | Cliente (token) o store externo | Memoria del servidor |
| Escalado horizontal | Trivial | Requiere afinidad/replicación |
| Caída de una instancia | No se pierde nada | Se pierden sesiones |
| Latencia | + (buscar estado) | − (ya está en memoria) |
| Ejemplos | REST, JWT, Lambda | WebSocket, juegos, DBs |

> En la práctica se combinan: **servicios stateless** + **estado en componentes especializados stateful** (DB, Redis, Kafka).

```bash
node stateful.js
```
