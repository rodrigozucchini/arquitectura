# 🏛️ Arquitectura de Software: Estilos, Patrones y Propiedades

Catálogo práctico con **31 ejemplos ejecutables**, organizados en tres grupos que **no son lo mismo**:

| Carpeta | Qué contiene | Pregunta que responde |
|---|---|---|
| [`estilos/`](estilos) | **19 estilos de arquitectura**: la forma general de todo el sistema | ¿Cómo está organizado el sistema entero? |
| [`patrones/`](patrones) | **10 patrones arquitectónicos**: soluciones a un problema concreto, que se usan *dentro* de un estilo | ¿Cómo resuelvo este problema puntual? |
| [`propiedades/`](propiedades) | **2 propiedades**: características que puede tener cualquier componente | ¿El componente guarda estado o no? |

Todo está en **Node.js puro (≥ 18, probado en v24)**, **sin dependencias**: no hace falta `npm install`. Los ejemplos son chicos a propósito, para que se vea la **estructura**.

> 💡 **Ejemplo de cómo se combinan:** un sistema puede tener el *estilo* **microservicios**, donde cada servicio usa el *estilo interno* **hexagonal**, entra por el *patrón* **API Gateway**, coordina pedidos con el *patrón* **Saga**, usa **CQRS** en reportes y tiene servicios **stateless** (*propiedad*) que guardan el estado en una base de datos stateful.

---

## 🏗️ Estilos de arquitectura (`estilos/`)

Un **estilo** define la forma global del sistema: qué componentes hay, cómo se despliegan y cómo se conectan. Se basan en las clasificaciones de Garlan & Shaw y de Richards & Ford.

### A. Estilos de despliegue (¿cuántas unidades despliego?)

| # | Estilo | Ejecutar |
|---|---|---|
| 01 | [Monolito](estilos/01-monolito) | `npm run e01` |
| 02 | [Monolito Modular](estilos/02-monolito-modular) | `npm run e02` |
| 03 | [Service-Based](estilos/03-service-based) | `npm run e03` |
| 04 | [Microservicios](estilos/04-microservicios) | `npm run e04` |
| 05 | [SOA + ESB](estilos/05-soa) | `npm run e05` |
| 06 | [Serverless](estilos/06-serverless) | `npm run e06` |

**01 · Monolito.** Toda la aplicación en un solo código y un solo despliegue. Es lo más simple: llamadas en memoria, una base de datos y transacciones fáciles. Con el crecimiento se acopla, escala todo junto y los equipos se pisan. *Para MVPs y equipos chicos.*

**02 · Monolito Modular.** Un solo despliegue dividido en módulos por dominio, cada uno con datos privados y una API pública. Tiene la simplicidad del monolito con el orden de los microservicios, y es el punto de partida recomendado hoy.

**03 · Service-Based.** Pocos servicios de dominio **grandes** (4 a 12) desplegados por separado que **comparten una base de datos**. Es el punto medio pragmático: despliegue independiente pero con transacciones ACID y joins simples. El costo es que la DB compartida acopla a los servicios.

**04 · Microservicios.** Muchos servicios pequeños y autónomos, **cada uno con su propia base de datos**, que se comunican por red. Ganás escalado, deploy y equipos independientes. Pagás con la complejidad de un sistema distribuido: latencia, fallos parciales, consistencia eventual y observabilidad.

**05 · SOA.** La predecesora empresarial: servicios reutilizables de grano grueso integrados por un **ESB** que enruta, transforma y orquesta. Sirve para integrar sistemas legacy; el ESB tiende a ser un cuello de botella.

**06 · Serverless.** Funciones (FaaS) que el proveedor ejecuta bajo demanda ante eventos, con servicios gestionados (BaaS) para el estado. Escala sola y se paga por uso. Las contras son los cold starts, los límites de ejecución y el vendor lock-in.

**Monolito → Microservicios, de un vistazo:**

| | Monolito | Monolito Modular | Service-Based | Microservicios |
|---|---|---|---|---|
| Despliegues | 1 | 1 | 4-12 | Decenas o cientos |
| Base de datos | 1 | 1 (esquemas por módulo) | Compartida | Una por servicio |
| Transacciones | ACID | ACID | ACID | Saga / eventual |
| Complejidad operativa | 🟢 | 🟢 | 🟠 | 🔴 |

### B. Estilos de estructura interna (¿cómo organizo el código de una aplicación?)

| # | Estilo | Ejecutar |
|---|---|---|
| 07 | [Capas / N-Tier](estilos/07-capas-n-tier) | `npm run e07` |
| 08 | [Hexagonal (Puertos y Adaptadores)](estilos/08-hexagonal) | `npm run e08` |
| 09 | [Onion](estilos/09-onion) | `npm run e09` |
| 10 | [Clean Architecture](estilos/10-clean-architecture) | `npm run e10` |
| 11 | [Microkernel (Plugins)](estilos/11-microkernel) | `npm run e11` |

**07 · Capas.** Presentación → Negocio → Datos; cada capa usa solo la de abajo. Es la más conocida, pero el negocio termina dependiendo de la base de datos.

**08 · Hexagonal.** El dominio al centro, sin dependencias técnicas. Se conecta al exterior por **puertos** (interfaces) que implementan **adaptadores** (HTTP, CLI, SQL). En el ejemplo, el mismo dominio corre con CLI + memoria o con HTTP + archivo.

**09 · Onion.** Anillos concéntricos (Domain Model → Domain Services → Application Services → Infraestructura) donde **la infraestructura depende del dominio**.

**10 · Clean Architecture.** La versión de Uncle Bob: Entities → Use Cases → Interface Adapters → Frameworks, con la regla de que **las dependencias solo apuntan hacia adentro**.

> Hexagonal, Onion y Clean son **la misma idea** (dominio al centro e inversión de dependencias) con distinto vocabulario.

**11 · Microkernel.** Un núcleo mínimo más **plugins** que lo extienden por puntos de extensión. Así funcionan VS Code, los navegadores, WordPress y ESLint.

### C. Estilos de comunicación y flujo (¿cómo interactúan los componentes?)

| # | Estilo | Ejecutar |
|---|---|---|
| 12 | [Pipes and Filters](estilos/12-pipes-and-filters) | `npm run e12` |
| 13 | [Event-Driven](estilos/13-event-driven) | `npm run e13` |
| 14 | [Space-Based](estilos/14-space-based) | `npm run e14` |
| 15 | [Cliente-Servidor](estilos/15-cliente-servidor) | `npm run e15:servidor` + `npm run e15:cliente` |
| 16 | [Peer-to-Peer](estilos/16-peer-to-peer) | `npm run e16` |
| 17 | [Broker](estilos/17-broker) | `npm run e17` |

**12 · Pipes and Filters.** Una cadena de filtros independientes unidos por pipes, como la shell de Unix, los compiladores o un ETL.

**13 · Event-Driven.** Los componentes publican eventos y otros reaccionan sin conocerse. Puede ser por coreografía (broker) u orquestación (mediator). Desacopla mucho; el flujo es difícil de seguir.

**14 · Space-Based.** Para picos extremos: los datos viven en memoria replicada dentro de processing units elásticas, y la DB se actualiza de forma asíncrona.

**15 · Cliente-Servidor.** Un servidor centraliza recursos y muchos clientes los piden. Es la base de la web.

**16 · Peer-to-Peer.** Sin servidor central; cada nodo es cliente y servidor (BitTorrent, blockchain, IPFS).

**17 · Broker.** Un intermediario registra servidores y enruta peticiones por nombre (CORBA, RabbitMQ, Kafka).

### D. Estilos de dominio específico

| # | Estilo | Ejecutar |
|---|---|---|
| 18 | [Micro-Frontends](estilos/18-micro-frontends) | `npm run e18` |
| 19 | [Lambda y Kappa](estilos/19-lambda-kappa) | `npm run e19` |

**18 · Micro-Frontends.** El estilo de microservicios aplicado al **frontend**: cada equipo despliega su parte de la UI y una app shell las compone.

**19 · Lambda y Kappa.** Arquitecturas para **big data**. Lambda tiene capa batch + speed + serving; Kappa usa un único pipeline de streaming sobre un log que se puede reprocesar.

> Estos dos son "estilos" solo dentro de su dominio (frontend y procesamiento de datos); algunos autores los consideran patrones.

---

## 🧩 Patrones arquitectónicos (`patrones/`)

Un **patrón** resuelve un **problema concreto** y se aplica *dentro* de un estilo. No definen la forma de todo el sistema.

| # | Patrón | Tipo | Problema que resuelve | Ejecutar |
|---|---|---|---|---|
| 01 | [CQRS](patrones/01-cqrs) | Datos | Lecturas y escrituras con necesidades muy distintas | `npm run p01` |
| 02 | [Event Sourcing](patrones/02-event-sourcing) | Datos | Necesito el historial completo y auditoría | `npm run p02` |
| 03 | [Saga](patrones/03-saga) | Distribuido | Transacciones entre servicios sin ACID global | `npm run p03` |
| 04 | [Leader-Follower](patrones/04-leader-follower) | Distribuido | Replicación y alta disponibilidad | `npm run p04` |
| 05 | [API Gateway](patrones/05-api-gateway) | Bordes | Un punto de entrada con auth, rate limit y caché | `npm run p05` |
| 06 | [BFF](patrones/06-bff) | Bordes | Cada cliente necesita datos distintos | `npm run p06` |
| 07 | [Sidecar / Service Mesh](patrones/07-sidecar-service-mesh) | Infraestructura | Reintentos, mTLS y métricas sin tocar el código | `npm run p07` |
| 08 | [MVC](patrones/08-mvc) | Interfaz | Separar datos, vista y entrada | `npm run p08` |
| 09 | [MVVM](patrones/09-mvvm) | Interfaz | UI reactiva con data binding | abrir `index.html` |
| 10 | [Actor Model](patrones/10-actor-model) | Concurrencia | Concurrencia sin locks + tolerancia a fallos | `npm run p10` |

**01 · CQRS.** Separa el modelo de escritura (commands) del de lectura (queries sobre vistas desnormalizadas). Suele combinarse con Event Sourcing.

**02 · Event Sourcing.** Se guardan los eventos en vez del estado actual, y el estado se reconstruye reproduciéndolos. Da auditoría y "viaje en el tiempo".

**03 · Saga.** Una secuencia de transacciones locales con **compensaciones** si algo falla. Puede ser orquestada o coreografiada. Es imprescindible en microservicios; en Service-Based suele no hacer falta.

**04 · Leader-Follower.** Un líder recibe las escrituras y las replica a seguidores que sirven lecturas. Usa quórum y elige un nuevo líder ante caídas (PostgreSQL, MongoDB, Kafka, etcd).

**05 · API Gateway.** Una puerta de entrada única con autenticación, rate limiting, enrutamiento, caché, circuit breaker y agregación.

**06 · BFF.** Un backend por tipo de cliente. El mismo producto ocupa 801 bytes en web, 101 en móvil y 28 en un reloj.

**07 · Sidecar / Service Mesh.** Un proceso al lado de cada servicio agrega reintentos, mTLS y trazas. Todos los sidecars más un control plane forman el mesh.

**08 · MVC / 09 · MVVM.** Patrones de **interfaz**: organizan una pantalla o componente, no el sistema. MVC usa un Controller; MVVM usa un ViewModel con binding automático.

**10 · Actor Model.** Actores con estado privado que se comunican solo por mensajes, así que no hay locks. Los supervisores reinician a los que fallan (Erlang, Akka, Orleans).

---

## ⚙️ Propiedades (`propiedades/`)

No son estilos ni patrones: son **características** de un componente. Un monolito, un microservicio o una función pueden ser stateless o stateful.

| # | Propiedad | Ejecutar |
|---|---|---|
| 01 | [Stateless](propiedades/01-stateless) | `npm run s01` |
| 02 | [Stateful](propiedades/02-stateful) | `npm run s02` |

**01 · Stateless.** El servidor **no recuerda nada** entre peticiones: cada request trae todo (por ejemplo un JWT) o el estado vive en un store externo. Cualquier instancia atiende cualquier request. En el ejemplo, 3 instancias se turnan y el carrito nunca se pierde.

**02 · Stateful.** El servidor **guarda en memoria** sesiones, conexiones o partidas. Tiene muy baja latencia y es natural para tiempo real, pero para escalar necesita sticky sessions o replicación, y si cae se pierde el estado. El ejemplo muestra cómo falla con round-robin, cómo lo arreglan las sticky sessions, y un chat TCP.

| | Stateless | Stateful |
|---|---|---|
| Dónde vive el estado | En el cliente (token) o en un store externo | En la memoria del servidor |
| Escalado horizontal | Trivial | Requiere afinidad o replicación |
| Si cae una instancia | No se pierde nada | Se pierden sesiones o conexiones |
| Latencia | Mayor | Menor |
| Ejemplos | REST, JWT, Lambda, CDN | WebSocket, juegos, bases de datos, actores |

> 💡 **Lo habitual:** servicios de aplicación **stateless** + el estado concentrado en componentes **stateful** especializados (PostgreSQL, Redis, Kafka).

---

## 🧭 ¿Qué elijo?

```
1. ESTILO DE DESPLIEGUE
   ¿Equipo chico o producto nuevo?            → Monolito Modular
   ¿Varios equipos, pero sin datos distribuidos? → Service-Based
   ¿Muchos equipos y escala muy desigual?      → Microservicios
   ¿Carga intermitente o impredecible?         → Serverless
   ¿Picos extremos (tickets, subastas)?        → Space-Based

2. ESTILO INTERNO (dentro de cada aplicación o servicio)
   ¿CRUD simple?                → Capas
   ¿Dominio rico, mucha lógica? → Hexagonal / Clean / Onion
   ¿Producto extensible?        → Microkernel

3. PATRONES según el problema
   Transacción entre servicios   → Saga
   Lecturas pesadas              → CQRS + réplicas (Leader-Follower)
   Auditoría o historial         → Event Sourcing
   Muchos tipos de cliente       → BFF / API Gateway
   Resiliencia de red uniforme   → Service Mesh

4. PROPIEDAD: por defecto, servicios stateless; el estado, en la base de datos o cache.
```

**Reglas de oro:**
1. **No existe la mejor arquitectura**, solo trade-offs.
2. **Empezá simple** y evolucioná cuando el dolor sea real.
3. **Los límites del dominio importan más que la tecnología.** Microservicios con malos límites terminan siendo un *monolito distribuido*.
4. **Preferí componentes stateless** y concentrá el estado.

---

## 🚀 Cómo usarlo

```bash
npm run e03     # estilo: service-based
npm run p03     # patrón: saga
npm run s01     # propiedad: stateless
# o directamente: node estilos/03-service-based/start-all.js
```

Algunos ejemplos levantan servidores que quedan escuchando: e01, e06, e08:http, e10, e18 y p08. Cada README indica los `curl` para probarlos, y se cortan con `Ctrl+C`. El resto se ejecuta y termina solo.

## 📖 Para profundizar

- *Fundamentals of Software Architecture*, Mark Richards y Neal Ford (origen de la clasificación de estilos y de Service-Based)
- *Software Architecture: The Hard Parts*, Ford, Richards, Sadalage y Dehghani
- *Software Architecture: Perspectives on an Emerging Discipline*, Mary Shaw y David Garlan (estilos clásicos)
- *Clean Architecture*, Robert C. Martin
- *Building Microservices*, Sam Newman
- *Designing Data-Intensive Applications*, Martin Kleppmann
- *Pattern-Oriented Software Architecture (POSA)*, Buschmann et al. (Broker, Microkernel, Pipes and Filters, MVC)
- microservices.io, de Chris Richardson (Saga, CQRS, API Gateway, Sidecar)
