# 04 · Leader-Follower (Primary-Replica, antes "Master-Slave")

Un nodo **líder** recibe todas las **escrituras** y las **replica** a nodos **seguidores**, que atienden **lecturas**. Si el líder cae, se **elige** uno nuevo.

```
 escrituras ─► [LÍDER] ──replica──► [Seguidor 1] ◄── lecturas
                    └────replica──► [Seguidor 2] ◄── lecturas
```

**Conceptos:**
- **Replicación síncrona** (más segura, más lenta) vs **asíncrona** (rápida, puede perder datos / lag de réplica).
- **Quórum:** una escritura se confirma cuando la mayoría la tiene.
- **Elección de líder / failover:** algoritmos Raft, Paxos, ZAB (ZooKeeper).
- **Split brain:** dos líderes a la vez → se evita exigiendo mayoría.

**Ejemplos reales:** réplicas de PostgreSQL/MySQL, MongoDB replica sets, Redis Sentinel, Kafka (líder por partición), etcd/Consul (Raft), Kubernetes control plane.

**Ventajas:** escala lecturas, alta disponibilidad, backups sin afectar al líder.
**Desventajas:** el líder limita las escrituras; consistencia eventual en lecturas de réplicas; failover complejo.

```bash
node leader-follower.js
```
