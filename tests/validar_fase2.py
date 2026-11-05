"""Validación de la Fase 2 de Menu_Dial (panel de contenido con medio dial) con Playwright + Edge.

Primero corre la validación de la Fase 1 (criterio 6: sin el panel todo sigue igual), luego
sirve la carpeta del proyecto por HTTP y recorre los criterios de la Fase 2 de
06_IMPLEMENTATION.md. Capturas en tests/capturas/. Uso:  python tests/validar_fase2.py
"""
import math
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validar_fase1 import SHOTS, active_label, serve, wait_settle  # noqa: E402

results = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"[{'OK' if ok else 'FALLA'}] {name}{' — ' + detail if detail else ''}")


def is_open(page):
    return page.evaluate("isOpen")


def panel_title(page):
    return page.text_content("#panelTitle")


def dial_center(page):
    b = page.locator("#knob").bounding_box()
    return b["x"] + b["width"] / 2, b["y"] + b["height"] / 2, b["width"]


def main():
    # 6. Regresión: la validación de la Fase 1 debe seguir pasando completa
    fase1 = subprocess.run([sys.executable, str(Path(__file__).with_name("validar_fase1.py"))],
                           capture_output=True, text=True, encoding="utf-8")
    last = fase1.stdout.strip().splitlines()[-1] if fase1.stdout.strip() else fase1.stderr[-300:]
    check("6. Validación de la Fase 1 sin regresiones", fase1.returncode == 0, last)

    SHOTS.mkdir(exist_ok=True)
    httpd = serve()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("console", lambda m: m.type == "error" and errors.append(m.text))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(url, wait_until="networkidle")
        wait_settle(page)
        L = page.evaluate("ITEMS.map(i => i.label)")  # etiquetas desde data.js
        stage = page.locator("#stage").bounding_box()

        # 1a. Clic en una tarjeta no activa: gira hasta ella y abre su panel
        page.click(".option[data-index='1']")
        wait_settle(page)
        check("1a. Clic en tarjeta no activa gira y abre su panel",
              is_open(page) and active_label(page) == L[1] and panel_title(page) == L[1],
              f"abierto={is_open(page)}, título={panel_title(page)}")

        # 2. Medio dial a la izquierda, lista oculta y sin clics
        kx, ky, kw = dial_center(page)
        list_hidden = page.eval_on_selector(".options", "el => getComputedStyle(el).visibility") == "hidden"
        hit = page.evaluate("""(() => {
            const b = document.querySelector(".option[data-index='2']").getBoundingClientRect();
            const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
            return el ? !!el.closest('.option') : false;
        })()""")
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        pnl = page.locator("#panel").bounding_box()
        ring_right = page.locator("#ring").bounding_box()
        check("2. Medio dial en el borde izquierdo de la ventana (mitad oculta fuera)",
              abs(kx) < 4, f"centro del dial x={kx:.0f}")
        check("   Panel a la derecha del medio dial sin solaparse",
              pnl["x"] > ring_right["x"] + ring_right["width"],
              f"dial hasta x={ring_right['x'] + ring_right['width']:.0f}, panel desde x={pnl['x']:.0f}")
        check("   Lista oculta y sin recibir clics; sin scroll horizontal",
              list_hidden and not hit and not overflow)
        page.screenshot(path=str(SHOTS / "panel_1440.png"))

        # 3. Girar el medio dial cambia el contenido del panel
        r = kw / 2 * 1.35  # radio sobre el anillo, en píxeles de pantalla
        page.mouse.move(kx + r * 0.9, ky)
        page.mouse.wheel(0, 120)
        wait_settle(page)
        wheel_ok = panel_title(page) == L[2]
        page.keyboard.press("ArrowDown")
        wait_settle(page)
        key_ok = panel_title(page) == L[3]
        page.click("#btnUp")
        wait_settle(page)
        btn_ok = panel_title(page) == L[2]
        # Arrastre sobre la mitad visible: de +60° a −60° (antihorario, ≈ 2,7 segmentos → 3)
        page.mouse.move(kx + r * math.cos(math.radians(60)), ky + r * math.sin(math.radians(60)))
        page.mouse.down()
        for k in range(1, 25):
            a = math.radians(60 - 120 * k / 24)
            page.mouse.move(kx + r * math.cos(a), ky + r * math.sin(a))
        page.mouse.up()
        wait_settle(page)
        drag_ok = panel_title(page) == L[5] and is_open(page)
        check("3. Rueda, teclado, flechas y arrastre cambian el panel",
              wheel_ok and key_ok and btn_ok and drag_ok,
              f"rueda={wheel_ok}, teclado={key_ok}, flecha={btn_ok}, arrastre={drag_ok} ({panel_title(page)})")

        # 4. Las 8 opciones tienen contenido propio
        seen = {}
        for i in range(8):
            page.evaluate(f"goTo({i})")
            wait_settle(page)
            info = page.evaluate("""(() => {
                const c = document.querySelector('#panelBody .panel-content');
                return { title: document.querySelector('#panelTitle').textContent,
                         type: c?.dataset.type, index: Number(c?.dataset.index), kids: c?.children.length || 0 };
            })()""")
            seen[i] = info
        labels = [page.evaluate(f"ITEMS[{i}].label") for i in range(8)]
        types = {v["type"] for v in seen.values()}
        all_ok = all(seen[i]["title"] == labels[i] and seen[i]["index"] == i and seen[i]["kids"] > 0 for i in range(8))
        # Desde la Fase 3 varias opciones pueden compartir tipo (p. ej. Formación y Certificaciones usan `list`)
        check("4. Las 8 opciones tienen contenido propio", all_ok, f"tipos distintos: {len(types)}")

        page.evaluate("goTo(6)")
        wait_settle(page)

        # 5. Cerrar con ✕, Esc y perilla: dial al centro, lista visible, opción activa se mantiene
        def closed_ok(expected):
            kx2, _, _ = dial_center(page)
            vis = page.eval_on_selector(".options", "el => getComputedStyle(el).visibility") == "visible"
            return not is_open(page) and vis and active_label(page) == expected and kx2 > stage["x"] + 100

        page.click("#btnClose")
        wait_settle(page)
        x_ok = closed_ok(L[6])
        page.click("#btnOpen")  # 1b. □ abre la activa
        wait_settle(page)
        open_btn = is_open(page) and panel_title(page) == L[6]
        page.keyboard.press("Escape")
        wait_settle(page)
        esc_ok = closed_ok(L[6])
        page.focus("#knob")  # 1c. Enter en la perilla abre la activa
        page.keyboard.press("Enter")
        wait_settle(page)
        open_enter = is_open(page) and panel_title(page) == L[6]
        kx, ky, _ = dial_center(page)
        page.mouse.click(kx + 40, ky)  # perilla (mitad visible) cierra
        wait_settle(page)
        knob_close = closed_ok(L[6])
        kx, ky, _ = dial_center(page)
        page.mouse.click(kx, ky)  # 1d. perilla abre
        wait_settle(page)
        open_knob = is_open(page)
        check("1b-d. □, Enter y perilla abren la opción activa", open_btn and open_enter and open_knob)
        check("5. ✕, Esc y perilla cierran el panel y mantienen la opción", x_ok and esc_ok and knob_close,
              f"✕={x_ok}, Esc={esc_ok}, perilla={knob_close}")

        # 7. Móvil 390 px con el panel abierto: panel debajo del dial, sin scroll horizontal
        page.set_viewport_size({"width": 390, "height": 844})
        wait_settle(page)
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        pb = page.locator("#panel").bounding_box()
        sb = page.locator("#scaler").bounding_box()
        below = pb["y"] >= sb["y"] + sb["height"] - 1 and pb["x"] >= 0 and pb["x"] + pb["width"] <= 390
        fits = pb["y"] + pb["height"] <= 844
        page.screenshot(path=str(SHOTS / "panel_390.png"))
        check("7. 390 px: panel debajo del medio dial, dentro de la pantalla, sin scroll horizontal",
              below and fits and not overflow, f"panel y={pb['y']:.0f}-{pb['y'] + pb['height']:.0f}")
        check("   Sin errores en consola", not errors, "; ".join(errors))

        browser.close()
    httpd.shutdown()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones OK. Capturas en {SHOTS}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
