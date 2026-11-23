# 17 · Broker

Un **intermediario** coordina la comunicación entre clientes y servidores distribuidos. Los servidores se registran; los clientes piden servicios **por nombre**, sin conocer su ubicación.

```
[Cliente] ─► [Proxy cliente] ─► [ BROKER ] ─► [Proxy servidor] ─► [Servidor 1]
                                   │  registro / descubrimiento  └► [Servidor 2]
```

**Responsabilidades del broker:** registro y descubrimiento · enrutamiento · balanceo · (de)serialización · colas para comunicación asíncrona.

**Ejemplos:** CORBA, Java RMI, RabbitMQ, ActiveMQ, Apache Kafka, MQTT (IoT), Consul/Eureka + gRPC.

**Ventajas:** transparencia de ubicación, servidores intercambiables, desacoplamiento.
**Desventajas:** el broker es punto único de falla y de latencia (se mitiga con clusters).

```bash
node broker.js
```
