---
tecnologia: Web
tipo: herramienta
proyecto: Menu_Dial
estado: pendiente
estado_resumen: "Reabierto (Mecanismo B) — Fase 5: Proyectos con los datos del portafolio PDF"
stack: "HTML + CSS + JS vainilla, sin frameworks (fuente Inter de Google Fonts)"
descripcion: "Portafolio personal en forma de menú radial tipo dial (anillo de segmentos + perilla giratoria + lista en arco) con panel de contenido por opción y medio dial; contenido en data.js"
aliases: [Menu_Dial]
---

# Menu_Dial — README

> Ubicación: `Herramientas/Web/` (herramienta).
> Última revisión: 2026-11-05.

## Propósito

Portafolio personal de Ricardo Villamil Martínez en forma de menú tipo dial. En escritorio: anillo de segmentos con íconos, perilla giratoria y lista en arco; al elegir una opción se abre un panel de contenido con un medio dial para cambiar de sección. Se gira arrastrando, con la rueda o con el teclado. Por debajo de 700 px se muestra una tarjeta-menú con hoja a pantalla completa por sección. Todo el contenido sale de `data.js` (perfil, formación, certificaciones, experiencia, proyectos, logros, competencias y contacto); publicado en `https://rprimero93.github.io/menu-dial/`.

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
├── assets/      # esap_simbolo_negativo.svg (copiado del manual de marca ESAP)
├── tests/       # validar_fase1-4.py (Playwright + Edge); capturas/ fuera de Git
└── scripts/     # publicar_github.sh (espejo en GitHub)
```

El contenido se edita solo en `data.js` (`PORTFOLIO.header` y `PORTFOLIO.items`: etiqueta, ícono, descripción y contenido del panel); el anillo se recalcula solo según la cantidad de opciones.

## Publicación (espejo en GitHub)

- Repo público: `https://github.com/Rprimero93/menu-dial` · página: `https://rprimero93.github.io/menu-dial/` (GitHub Pages desde `main`, raíz).
- **Git (Regla 12):** el proyecto se versiona en el repo de la bóveda; GitHub es solo un espejo. No se crea un `.git` dentro de esta carpeta (rompería el versionado en la bóveda).
- Para republicar: `bash scripts/publicar_github.sh` (`--dry-run` para ensayar). Hace `git subtree split` de esta carpeta, cambia el correo de autor/committer por `Rprimero93@users.noreply.github.com` (el correo corporativo no se publica), quita `tests/__pycache__` y empuja a `main`. La cuenta de Git por defecto en este equipo es otra (`coorwallbox`): el remoto lleva el usuario `Rprimero93@` para que el administrador de credenciales use esa cuenta.

## Pruebas

`tests/validar_fase4.py` corre la suite completa (incluye las Fases 1-3): interacción del dial y del panel en escritorio, tarjeta-menú y hoja en móvil emulado (390 y 360 px), conteos calculados desde `data.js`, enlaces de contacto, `file://`, `prefers-reduced-motion`, privacidad (teléfono ausente), `data.js` sin claves repetidas y, con `--live`, el sitio publicado. **No cubre:** el aspecto visual, que se valida con el visto bueno del usuario, ni navegadores distintos de Edge.

## Lecciones aprendidas

- **Contenido aislado en un solo archivo de datos** (`data.js`, sin `fetch`): el usuario edita el contenido a mano y la página sigue funcionando con doble clic (`file://`). Riesgo descubierto: en un objeto literal de JS una clave repetida pisa a la anterior sin aviso; por eso las pruebas comprueban que `data.js` no tenga claves repetidas.
- **El modo móvil se decide con `matchMedia`, no con `innerWidth`:** en un celular real, un escenario de ancho fijo aleja el zoom e infla `innerWidth`. Solo se detectó al emular un celular de verdad (`is_mobile`, `has_touch`, `device_scale_factor`); con solo achicar el ancho de la ventana no aparecía.
- **Espejo público desde la bóveda sin `.git` anidado:** `git subtree split`, el correo cambiado por el noreply de GitHub y un control de privacidad por hash (sin guardar el teléfono en el script) antes de empujar. _(Desde el 2026-11-10 el teléfono se publica en Contacto por decisión del usuario: el control ya no aborta por el teléfono, solo por un PDF; las pruebas siguen reconociéndolo por su hash para comprobar que solo vive en `data.js`.)_
- **Proceso:** nunca hacer commit con una prueba en rojo; correr la suite completa justo antes del commit. Al editar una prueba, el comentario va en su propia línea (un `#` en medio de la línea anuló el resto de un diccionario de Python).
- Mini-retro de cierre (2026-11-05): el usuario no registró observaciones de proceso.

## Consumidores

_Proyectos que usaron esta herramienta (proyecto, fecha, qué le faltó) — `03_TRD.md` § Herramientas y entregables._

- **[[Entregables/Illustrator/Portafolio_Menu_Dial/docs/00_README|Portafolio_Menu_Dial]]** (2026-11-10): leyó `data.js` (vía Node, solo lectura) como fuente de todos los textos del portafolio en PDF. Le faltó: la lista y las descripciones actualizadas de los proyectos de la ESAP y de Los Coches (el usuario las dio aparte) y el teléfono (excluido a propósito del sitio público).

## Documentación relacionada

Ver `01_INDEX.md` para el mapa completo de la carpeta `docs/`.
