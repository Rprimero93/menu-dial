---
tecnologia: Web
tipo: herramienta
proyecto: Menu_Dial
estado: pendiente
estado_resumen: "Fases 1-3 cerradas y publicadas — pendiente el cierre del proyecto"
stack: "HTML + CSS + JS vainilla, sin frameworks (fuente Inter de Google Fonts)"
descripcion: "Portafolio personal en forma de menú radial tipo dial (anillo de segmentos + perilla giratoria + lista en arco) con panel de contenido por opción y medio dial; contenido en data.js"
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
├── data.js      # contenido: encabezado y opciones del portafolio (Fase 3)
├── index.html   # estructura: anillo SVG, perilla, conector, lista, controles, panel de contenido
├── styles.css   # tokens en :root, dial, lista, controles, panel y sus contenidos, modo compacto
├── script.js    # opciones (ITEMS), íconos, geometría, render animado, arrastre/rueda/teclado, panel
├── tests/       # validar_fase1.py, validar_fase2.py (Playwright + Edge); capturas/ fuera de Git
└── scripts/     # publicar_github.sh (espejo en GitHub)
```

El contenido se edita solo en `data.js` (`PORTFOLIO.header` y `PORTFOLIO.items`: etiqueta, ícono, descripción y contenido del panel); el anillo se recalcula solo según la cantidad de opciones.

## Publicación (espejo en GitHub)

- Repo público: `https://github.com/Rprimero93/menu-dial` · página: `https://rprimero93.github.io/menu-dial/` (GitHub Pages desde `main`, raíz).
- **Git (Regla 12):** el proyecto se versiona en el repo de la bóveda; GitHub es solo un espejo. No se crea un `.git` dentro de esta carpeta (rompería el versionado en la bóveda).
- Para republicar: `bash scripts/publicar_github.sh` (`--dry-run` para ensayar). Hace `git subtree split` de esta carpeta, cambia el correo de autor/committer por `Rprimero93@users.noreply.github.com` (el correo corporativo no se publica), quita `tests/__pycache__` y empuja a `main`. La cuenta de Git por defecto en este equipo es otra (`coorwallbox`): el remoto lleva el usuario `Rprimero93@` para que el administrador de credenciales use esa cuenta.

## Lecciones aprendidas

_(pendiente — se completa al cerrar el ciclo de aprendizaje del proyecto, Regla 4)_

## Consumidores

_Proyectos que usaron esta herramienta (proyecto, fecha, qué le faltó) — `03_TRD.md` § Herramientas y entregables. Sin consumidores registrados todavía._

## Documentación relacionada

Ver `01_INDEX.md` para el mapa completo de la carpeta `docs/`.
