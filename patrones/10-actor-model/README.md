# 10 · Actor Model (Modelo de Actores)

Modelo de concurrencia (Carl Hewitt, 1973) y arquitectura para sistemas distribuidos. El **actor** es la unidad básica:

- tiene **estado privado** (nadie lo comparte),
- tiene un **buzón** y procesa **un mensaje a la vez**,
- se comunica **solo por mensajes asíncronos**,
- puede crear actores hijos y **supervisarlos**.

```
 [Actor A] ──msg──► buzón ▸ [Actor B] ──msg──► buzón ▸ [Actor C]
     ▲                         │ falla
     └──── Supervisor ◄────────┘ (reinicia: "let it crash")
```

**Ejemplos reales:** Erlang/OTP y Elixir (WhatsApp, Discord), Akka (Scala/Java), Microsoft Orleans (Halo), Proto.Actor, Cloudflare Durable Objects.

**Ventajas:** concurrencia sin locks, tolerancia a fallos por supervisión, transparencia de ubicación (un actor puede estar en otra máquina), muy escalable.
**Desventajas:** depurar flujos de mensajes, orden y entrega no garantizados entre máquinas, buzones que se llenan (backpressure).

```bash
node actors.js
```
