# 16 · Peer-to-Peer (P2P)

No hay servidor central: **todos los nodos son iguales** (peers), cada uno actúa como cliente y servidor. Comparten recursos directamente entre sí.

```
  [Peer A] ─── [Peer B]
     │  ╲        │
     │    ╲      │
  [Peer D] ─── [Peer C]
```

**Tipos:**
- **No estructurado:** conexiones aleatorias, búsqueda por flooding/gossip (Gnutella).
- **Estructurado:** DHT (Distributed Hash Table) como Chord/Kademlia (BitTorrent, IPFS).
- **Híbrido:** un índice central + transferencia P2P (Napster original).

**Ejemplos reales:** BitTorrent, blockchain (Bitcoin, Ethereum), IPFS, WebRTC, Skype (original).

**Ventajas:** sin punto único de falla, escala con los usuarios (más peers = más capacidad), resiliente.
**Desventajas:** seguridad y confianza, difícil de coordinar, consistencia, descubrimiento de peers (NAT).

```bash
node p2p.js
```
