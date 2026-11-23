# 12 · Pipes and Filters (Tuberías y Filtros)

El procesamiento se divide en una secuencia de **filtros** independientes (cada uno hace una transformación) conectados por **pipes** que llevan la salida de uno a la entrada del siguiente.

```
[Fuente] ─pipe─► [Parsear] ─pipe─► [Filtrar] ─pipe─► [Enriquecer] ─pipe─► [Sumidero]
```

**Tipos de filtros:** productor (source), transformador, probador (filtra), consumidor (sink).

**Ejemplos reales:** shell de Unix (`cat | grep | sort`), compiladores (léxico → sintáctico → semántico → código), ETL, procesamiento de audio/video, middleware de Express, pipelines de CI/CD.

**Ventajas:** filtros reutilizables y recombinables, fácil de paralelizar, fácil de testear.
**Desventajas:** no sirve para sistemas interactivos; overhead de parseo entre filtros; manejo de errores en el medio del flujo.

```bash
node pipeline.js
```
