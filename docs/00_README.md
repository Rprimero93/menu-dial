---
tecnologia: Web
tipo: herramienta
proyecto: Menu_Dial
estado: pendiente
estado_resumen: "Fase 2 cerrada — Fase 3 (contenido real de los paneles) por planificar"
stack: "HTML + CSS + JS vainilla, sin frameworks (fuente Inter de Google Fonts)"
descripcion: "Menú radial tipo dial (anillo de segmentos + perilla giratoria + lista en arco) con panel de contenido por opción y medio dial, con opciones de ejemplo"
aliases: [Menu_Dial]
---

# Menu_Dial — README

> Ubicación: `Herramientas/Web/` (herramienta).
> Última revisión: 2026-11-05.

## Propósito

Menú de acceso rápido tipo dial, replicado a partir de una imagen de referencia: un anillo de segmentos con íconos y una perilla central que gira; la opción activa se resalta con un segmento rayado fijo y una línea que la conecta con su tarjeta en una lista dispuesta en arco. Se gira arrastrando, con la rueda o con el teclado, y la opción predeterminada se guarda o se descarta con «Guardar cambios» / «Cancelar». Viene con 8 opciones de ejemplo.

## Contexto

Código construido el 2026-11-05 fuera de la metodología y adoptado con la skill `adoptar-proyecto-existente`. Sin proyecto de referencia.

## Descubrimiento (resumen de decisiones)

- **Tipo:** herramienta (pieza de UI reutilizable, no un encargo puntual).
- **Git:** se versiona en el repo de la bóveda (Regla 12), sin `.gitignore` propio.
- **Componentes:** no usa componentes de Design_System_Core; es una pieza independiente.

## Estructura de archivos

```
Menu_Dial/
├── docs/
│   ├── 00_README.md
│   ├── 01_INDEX.md
│   ├── 06_IMPLEMENTATION.md
│   └── 07_PROGRESO_RESUMEN.md
├── index.html   # estructura: anillo SVG, perilla, conector, lista, controles, panel de contenido
├── styles.css   # tokens en :root, dial, lista, controles, panel y sus contenidos, modo compacto
├── script.js    # opciones (ITEMS), íconos, geometría, render animado, arrastre/rueda/teclado, panel
└── tests/       # validar_fase1.py, validar_fase2.py (Playwright + Edge); capturas/ fuera de Git
```

Las opciones se editan en el arreglo `ITEMS` al inicio de `script.js` (etiqueta, ícono, descripción y contenido del panel); el anillo se recalcula solo según su cantidad.

## Lecciones aprendidas

_(pendiente — se completa al cerrar el ciclo de aprendizaje del proyecto, Regla 4)_

## Consumidores

_Proyectos que usaron esta herramienta (proyecto, fecha, qué le faltó) — `03_TRD.md` § Herramientas y entregables. Sin consumidores registrados todavía._

## Documentación relacionada

Ver `01_INDEX.md` para el mapa completo de la carpeta `docs/`.
