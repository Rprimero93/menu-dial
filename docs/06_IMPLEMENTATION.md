# Implementación — Menu_Dial

> Checklist de fases. Cada fase cierra solo al cumplir sus criterios y quedar registrada en `07_PROGRESO_RESUMEN.md`.
> Checkbox: `[ ]` no iniciada · `[~]` construida, validación pendiente (no es un cierre) · `[x]` cerrada — criterios cumplidos y validación registrada (Regla 2).

- [x] **Fase 0 — Setup de contexto (adopción).** Traer el código (hecho fuera de la metodología el 2026-11-05) a `Herramientas/Web/Menu_Dial/` y crear `docs/` mínimo (`00_README`, `01_INDEX`, `07_PROGRESO_RESUMEN`, `06_IMPLEMENTATION`). Git: se versiona en el repo de la bóveda (Regla 12), sin acción extra.
  - Criterio: los 4 docs existen y reflejan las decisiones de descubrimiento; el código vive en la bóveda. **Cumplido.**

- [~] **Fase 1 — Validación en navegador y ajuste visual.** Validación con Playwright + Edge del sistema (`channel="msedge"`) contra la página servida por HTTP; el script de validación se guarda en el proyecto (`tests/validar_fase1.py`, preferencia de `INVENTARIO_Web.md`).
  - Ajustes de alcance pedidos por el usuario al arrancar la fase (2026-11-05): quitar «Cancelar»/«Guardar cambios», quitar la vista 3D (y su botón ≡), resplandor de la perilla en azul, esquinas redondeadas en los segmentos del anillo y en el realce (corregido el mismo día: primero se habían redondeado por error las tarjetas de la lista, que volvieron a su radio original de 10 px).
  - Criterios:
    1. Carga sin errores en consola.
    2. Arrastrar el dial y la rueda cambian la opción activa y ajustan a la más cercana.
    3. Las flechas ↑/↓ y las del teclado cambian la opción.
    4. Clic en un segmento o en una opción la deja activa.
    5. ✕ y Esc vuelven a la opción inicial; no quedan «Guardar»/«Cancelar» ni vista 3D; halo azul solo en el borde izquierdo (interior) del segmento activo (no en la perilla ni en el resto del segmento — ajustes pedidos por el usuario el mismo día); segmentos del anillo y realce con esquinas redondeadas; tarjetas de la lista con su radio original. _(Ajustado el 2026-11-05 por el cambio de alcance pedido por el usuario. Texto original: «"Guardar cambios" mueve la etiqueta "Predeterminado"; "Cancelar"/Esc vuelven a la guardada.»)_
    6. Se ve bien a 1440 px y a 390 px de ancho (captura de cada una), sin scroll horizontal.
    7. Visto bueno visual del usuario contra la imagen de referencia.
    8. Magnificación al hover (estilo Dock) en las tarjetas completas de la lista: la tarjeta bajo el puntero crece (+16 %) más que sus vecinas y las lejanas no cambian. En el anillo no hay zoom: al hover, el ícono del segmento se ilumina como el activo. Al salir, todo vuelve a escala 1 y sin ícono iluminado. _(Agregado el 2026-11-05 a pedido del usuario durante la fase; ajustado dos veces el mismo día. Segunda versión: «…en los íconos de los 8 segmentos: el ícono bajo el puntero crece (+50 %)…» — el usuario pidió llevar la magnificación a las tarjetas y dejar en el ícono solo el cambio de color. Texto original: «Magnificación al hover (estilo Dock) en los 8 segmentos del anillo: el segmento bajo el puntero crece (+14 %) más que sus vecinos, los lejanos no cambian, y al salir del anillo todo vuelve a escala 1.» Motivo del ajuste: el zoom de los segmentos no convenció al usuario; pidió aplicarlo solo al ícono.)_
