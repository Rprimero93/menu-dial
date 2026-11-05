# Implementación — Menu_Dial

> Checklist de fases. Cada fase cierra solo al cumplir sus criterios y quedar registrada en `07_PROGRESO_RESUMEN.md`.
> Checkbox: `[ ]` no iniciada · `[~]` construida, validación pendiente (no es un cierre) · `[x]` cerrada — criterios cumplidos y validación registrada (Regla 2).

- [x] **Fase 0 — Setup de contexto (adopción).** Traer el código (hecho fuera de la metodología el 2026-11-05) a `Herramientas/Web/Menu_Dial/` y crear `docs/` mínimo (`00_README`, `01_INDEX`, `07_PROGRESO_RESUMEN`, `06_IMPLEMENTATION`). Git: se versiona en el repo de la bóveda (Regla 12), sin acción extra.
  - Criterio: los 4 docs existen y reflejan las decisiones de descubrimiento; el código vive en la bóveda. **Cumplido.**

- [ ] **Fase 1 — Validación en navegador y ajuste visual.** Validación con Playwright + Edge del sistema (`channel="msedge"`) contra la página servida por HTTP; el script de validación se guarda en el proyecto (preferencia de `INVENTARIO_Web.md`).
  - Criterios:
    1. Carga sin errores en consola.
    2. Arrastrar el dial y la rueda cambian la opción activa y ajustan a la más cercana.
    3. Las flechas ↑/↓ y las del teclado cambian la opción.
    4. Clic en un segmento o en una opción la deja activa.
    5. «Guardar cambios» mueve la etiqueta «Predeterminado»; «Cancelar»/Esc vuelven a la guardada.
    6. Se ve bien a 1440 px y a 390 px de ancho (captura de cada una), sin scroll horizontal.
    7. Visto bueno visual del usuario contra la imagen de referencia.
