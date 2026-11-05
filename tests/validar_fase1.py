"""Validación de la Fase 1 de Menu_Dial con Playwright + Edge del sistema.

Sirve la carpeta del proyecto por HTTP, recorre los criterios de 06_IMPLEMENTATION.md
y guarda capturas en tests/capturas/. Uso:  python tests/validar_fase1.py
"""
import http.server
import math
import socketserver
import threading
from functools import partial
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = Path(__file__).resolve().parent / "capturas"
results = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"[{'OK' if ok else 'FALLA'}] {name}{' — ' + detail if detail else ''}")


def active_label(page):
    return page.eval_on_selector(".option.active .label", "el => el.textContent")


def wait_settle(page):
    # Espera a que la animación alcance la posición objetivo
    page.wait_for_timeout(900)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = partial(QuietHandler, directory=str(ROOT))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
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

        # 1. Consola limpia
        check("1. Carga sin errores en consola", not errors, "; ".join(errors))
        check("   Opción inicial activa", active_label(page) == "Gestión de proyectos", active_label(page))
        page.screenshot(path=str(SHOTS / "desktop_1440.png"))
        page.locator("#dial").screenshot(path=str(SHOTS / "dial_detalle.png"))

        # 2a. Rueda del ratón sobre el dial
        box = page.locator("#dial").bounding_box()
        cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
        page.mouse.move(cx, cy)
        page.mouse.wheel(0, 120)
        wait_settle(page)
        check("2a. Rueda avanza una opción", active_label(page) == "Notas de reunión", active_label(page))

        # 2b. Arrastre: un cuarto de vuelta antihorario (≈ 2 segmentos) y ajuste a entero
        r = 160
        page.mouse.move(cx + r, cy)
        page.mouse.down()
        for k in range(1, 21):
            a = -math.radians(90 * k / 20)
            page.mouse.move(cx + r * math.cos(a), cy + r * math.sin(a))
        page.mouse.up()
        wait_settle(page)
        pos = page.evaluate("current")
        check("2b. Arrastre cambia la opción y ajusta a entero",
              active_label(page) == "Calendario" and abs(pos - round(pos)) < 1e-6,
              f"{active_label(page)} (posición {pos:.3f})")

        # 3. Flechas en pantalla y teclado
        page.click("#btnUp")
        wait_settle(page)
        up_ok = active_label(page) == "Ventas y marketing"
        page.click("#btnDown")
        wait_settle(page)
        down_ok = active_label(page) == "Calendario"
        page.keyboard.press("ArrowDown")
        wait_settle(page)
        key_ok = active_label(page) == "Contactos"
        check("3. Flechas ↑/↓ y teclado", up_ok and down_ok and key_ok, active_label(page))

        # 4a. Clic en una opción de la lista (la siguiente, visible)
        page.click(".option[data-index='5']")
        wait_settle(page)
        check("4a. Clic en opción de la lista", active_label(page) == "Ajustes", active_label(page))

        # 4b. Clic en un segmento del anillo (el que está a las 9 en punto: opuesto al activo)
        page.mouse.click(cx - 150, cy)
        wait_settle(page)
        check("4b. Clic en segmento del anillo", active_label(page) == "Notas de reunión", active_label(page))

        # 5. ✕ y Esc vuelven a la opción inicial
        page.keyboard.press("ArrowDown")
        wait_settle(page)
        page.keyboard.press("Escape")
        wait_settle(page)
        esc_ok = active_label(page) == "Gestión de proyectos"
        page.keyboard.press("ArrowDown")
        wait_settle(page)
        page.click("#btnClose")
        wait_settle(page)
        x_ok = active_label(page) == "Gestión de proyectos"
        check("5. ✕ y Esc vuelven a la opción inicial", esc_ok and x_ok)

        # Cambios pedidos: sin botones inferiores ni vista 3D, resplandor azul,
        # segmentos del anillo con esquinas redondeadas y tarjetas de la lista como antes (10 px)
        no_buttons = page.locator("#btnSave, #btnCancel, #btnTilt").count() == 0
        flat = page.eval_on_selector(".scene", "el => getComputedStyle(el).transform") == "none"
        glow = page.eval_on_selector(".knob", "el => getComputedStyle(el).boxShadow")
        radius = page.eval_on_selector(".option", "el => parseFloat(getComputedStyle(el).borderTopLeftRadius)")
        # Un sector redondeado tiene 6 arcos (2 bordes + 4 esquinas); uno recto tendría 2
        seg_arcs = page.eval_on_selector(".segment", "el => (el.getAttribute('d').match(/A/g) || []).length")
        hl_arcs = page.eval_on_selector("#highlight", "el => (el.getAttribute('d').match(/A/g) || []).length")
        check("   Sin Guardar/Cancelar ni botón 3D", no_buttons)
        check("   Escena plana (sin 3D)", flat)
        check("   Resplandor azul en la perilla", "rgba(64, 150, 255" in glow)
        check("   Segmentos y realce con esquinas redondeadas", seg_arcs == 6 and hl_arcs == 6,
              f"arcos segmento {seg_arcs}, realce {hl_arcs}")
        check("   Tarjetas de la lista con radio original", radius == 10, f"radio {radius}px")

        # 8. Magnificación al hover: el segmento bajo el puntero crece más que sus vecinos
        page.mouse.move(cx - 150, cy)  # sobre el segmento a las 9 en punto
        wait_settle(page)
        m = page.evaluate("({ mags, idx: mod(Math.round(target), N) })")
        hovered = (m["idx"] + 4) % 8
        prev_, next_ = (hovered - 1) % 8, (hovered + 1) % 8
        far = (hovered + 4) % 8
        mags = m["mags"]
        check("8. Magnificación: hover > vecinos > lejanos",
              mags[hovered] > mags[prev_] > 1.0 and abs(mags[prev_] - mags[next_]) < 1e-3
              and abs(mags[far] - 1.0) < 1e-3,
              f"hover {mags[hovered]:.3f}, vecinos {mags[prev_]:.3f}/{mags[next_]:.3f}, opuesto {mags[far]:.3f}")
        page.locator("#dial").screenshot(path=str(SHOTS / "dial_magnificacion.png"))
        page.mouse.move(5, 5)  # fuera del dial
        wait_settle(page)
        rest = page.evaluate("mags.every(v => v === 1) && hlMag === 1")
        check("   Al salir del anillo vuelve a escala 1", rest)

        # 6. Móvil 390 px sin scroll horizontal
        page.set_viewport_size({"width": 390, "height": 844})
        wait_settle(page)
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        page.screenshot(path=str(SHOTS / "movil_390.png"))
        check("6. 390 px sin scroll horizontal", not overflow)
        check("   Sin errores tras todo el recorrido", not errors, "; ".join(errors))

        browser.close()
    httpd.shutdown()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones OK. Capturas en {SHOTS}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
