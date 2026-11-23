# 10 · Clean Architecture

Propuesta por Robert C. Martin (Uncle Bob). Unifica Hexagonal, Onion y otras en **círculos concéntricos** con una sola regla:

> **Regla de dependencia:** el código fuente solo puede apuntar **hacia adentro**. Nada de un círculo interno sabe del externo.

```
┌──────────────── Frameworks & Drivers (web, DB, UI) ───────────────┐
│ ┌──────────── Interface Adapters (controllers, presenters, gw) ─┐ │
│ │ ┌──────────── Use Cases (reglas de aplicación) ────────────┐  │ │
│ │ │            ┌──── Entities (reglas de empresa) ───┐       │  │ │
│ │ │            └─────────────────────────────────────┘       │  │ │
│ │ └──────────────────────────────────────────────────────────┘  │ │
│ └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

Flujo: `HTTP → Controller → UseCase(Input DTO) → Entities → Gateway(interfaz) → Presenter(Output DTO) → ViewModel`.

**Ventajas:** independiente de frameworks, UI y BD; altamente testeable.
**Desventajas:** mucho boilerplate (DTOs, mappers); curva de aprendizaje.

```bash
node frameworks/main.js
curl -X POST localhost:3007 -d '{"email":"ana@mail.com","nombre":"Ana"}'
```
