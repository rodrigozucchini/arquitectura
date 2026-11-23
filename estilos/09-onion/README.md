# 09 · Onion Architecture (Cebolla)

Propuesta por Jeffrey Palermo (2008). Capas concéntricas con el **modelo de dominio en el centro**. Muy usada en .NET.

```
 ┌──────────── 4. Infraestructura / UI / Tests ────────────┐
 │  ┌────────── 3. Application Services ───────────┐       │
 │  │  ┌──────── 2. Domain Services + Interfaces ┐ │       │
 │  │  │      ┌── 1. Domain Model ──┐            │ │       │
 │  │  │      └─────────────────────┘            │ │       │
 │  │  └─────────────────────────────────────────┘ │       │
 │  └──────────────────────────────────────────────┘       │
 └─────────────────────────────────────────────────────────┘
```

**Diferencia con capas tradicionales:** en N-Tier el negocio depende de la capa de datos; en Onion la **infraestructura depende del dominio** (las interfaces de repositorio viven en el centro).

**Hexagonal vs Onion vs Clean:** las tres comparten la idea de "dominio al centro + inversión de dependencias". Hexagonal habla de puertos/adaptadores (adentro/afuera), Onion define anillos internos explícitos, Clean formaliza la regla de dependencia y los DTOs.

```bash
node 4-infrastructure.js
```
