"""Validación de la Fase 4 de Menu_Dial (versión móvil en tarjeta-menú) con Playwright + Edge.

Emula un celular (is_mobile + táctil) a 390x844 y 360x640 y revisa: tarjeta con las 8 opciones,
conteos desde data.js, hoja a pantalla completa (←, Esc y Atrás), enlaces de Contacto, doble clic
(file://), movimiento reducido y privacidad. Corre antes la validación de la Fase 3 (que incluye la 1 y la 2).
Uso:  python tests/validar_fase4.py [--live]
"""
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validar_fase1 import ROOT, SHOTS, serve  # noqa: E402
from validar_fase3 import LIVE_URL, has_phone  # noqa: E402

results = []
PHONES = [(390, 844), (360, 640)]


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"[{'OK' if ok else 'FALLA'}] {name}{' — ' + detail if detail else ''}")


def phone(browser, w=390, h=844, **kw):
    ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=True, has_touch=True,
                              device_scale_factor=2, **kw)
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    page.on("pageerror", lambda e: errors.append(str(e)))
    return ctx, page, errors


def settle(page, ms=500):
    page.wait_for_timeout(ms)


def duplicate_keys(src):
    """Claves repetidas en un mismo objeto de data.js: JS no avisa, la segunda pisa a la primera."""
    src = re.sub(r"'(?:\\.|[^'\\\n])*'", "''", src)  # textos entre comillas simples
    src = re.sub(r"//[^\n]*", "", src)                 # comentarios de línea
    stack, dups = [], []
    for m in re.finditer(r"[{}\[\]]|(\b[A-Za-z_]\w*)\s*:", src):
        t = m.group(0)
        if t in "{[":
            stack.append(set() if t == "{" else None)
        elif t in "}]":
            stack.pop()
        elif stack and stack[-1] is not None:
            if m.group(1) in stack[-1]:
                dups.append(f"{m.group(1)} (línea {src.count(chr(10), 0, m.start()) + 1})")
            stack[-1].add(m.group(1))
    return dups


def sheet_open(page):
    return page.evaluate("sheetIndex !== null && document.getElementById('mSheet').classList.contains('open')")


def main():
    live = "--live" in sys.argv

    # 5. Regresión: Fase 3 (que corre la 2 y la 1); escritorio sin cambios
    fase3 = subprocess.run([sys.executable, str(Path(__file__).with_name("validar_fase3.py"))],
                           capture_output=True, text=True, encoding="utf-8")
    lines = (fase3.stdout or "").strip().splitlines()
    detail = next((l for l in reversed(lines) if "comprobaciones OK" in l), (fase3.stderr or "")[-300:])
    check("5. Validaciones de las Fases 1, 2 y 3 sin regresiones", fase3.returncode == 0, detail)

    # 2c. data.js sin claves repetidas (una segunda `text` borraría la primera sin error visible)
    dups = duplicate_keys((ROOT / "data.js").read_text(encoding="utf-8"))
    check("2c. data.js sin claves repetidas en un mismo objeto", not dups, ", ".join(dups) or "—")

    # 6c. Privacidad de lo que se publica
    files = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True).stdout.split()
    files += ["tests/validar_fase4.py"]
    leaks = [f for f in set(files) if (ROOT / f).is_file() and has_phone((ROOT / f).read_text(encoding="utf-8", errors="ignore"))]
    check("6c. Ningún archivo publicado contiene el teléfono", not leaks, f"{leaks or '—'}")

    SHOTS.mkdir(exist_ok=True)
    httpd = serve()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")

        # 1. Tarjeta-menú a 390 y 360 px
        for w, h in PHONES:
            ctx, page, errors = phone(browser, w, h)
            page.goto(url, wait_until="networkidle")
            settle(page)
            info = page.evaluate("""() => ({
                card: getComputedStyle(document.querySelector('.m-card')).display !== 'none',
                dial: getComputedStyle(document.getElementById('scaler')).display === 'none',
                ids: [...new Set([...document.querySelectorAll('.m-row')].map(r => r.dataset.id))],
                all: ITEMS.map(i => i.id),
                overflow: document.documentElement.scrollWidth > innerWidth,
                inside: [...document.querySelectorAll('.m-row')].every(r => {
                    const b = r.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth; }),
            })""")
            page.screenshot(path=str(SHOTS / f"movil_tarjeta_{w}.png"), full_page=True)
            ok = info["card"] and info["dial"] and sorted(info["ids"]) == sorted(info["all"]) \
                and not info["overflow"] and info["inside"] and not errors
            check(f"1. {w} px: tarjeta con las {len(info['all'])} opciones, sin scroll horizontal ni errores", ok,
                  f"opciones={len(info['ids'])}, dial oculto={info['dial']}, errores={errors or '—'}")
            ctx.close()

        # 2a. Conteos de la derecha calculados desde data.js
        ctx, page, errors = phone(browser)
        page.goto(url, wait_until="networkidle")
        settle(page)
        counts = page.evaluate("""() => Object.fromEntries([...document.querySelectorAll('button.m-row')]
            .filter(r => r.querySelector('.m-count')).map(r => [r.dataset.id, Number(r.querySelector('.m-count').textContent)]))""")
        expected = page.evaluate("""() => Object.fromEntries(ITEMS.map(it => [it.id, itemCount(it.content)])
            .filter(([, n]) => n !== null))""")
        check("2a. Conteos de la tarjeta = elementos en data.js", counts == expected and len(counts) >= 3, str(counts))

        # 3. Cada fila abre su hoja; ←, Esc y Atrás la cierran
        rows = page.eval_on_selector_all("button.m-row", "els => els.map(e => [e.dataset.index, e.dataset.id])")
        bad = []
        for idx, rid in rows:
            page.tap(f"button.m-row[data-index='{idx}']")
            settle(page, 450)
            title = page.text_content("#mSheetTitle")
            label = page.evaluate(f"ITEMS[{idx}].label")
            kids = page.locator("#mSheetBody .panel-content > *").count()
            if not (sheet_open(page) and title == label and kids > 0):
                bad.append(rid)
            if rid == "experience":
                page.screenshot(path=str(SHOTS / "movil_hoja_experiencia.png"))
            page.tap("#mBack")
            settle(page, 450)
            if sheet_open(page):
                bad.append(f"{rid}: ← no cerró")
        check("3a. Cada fila abre su hoja con su contenido y ← la cierra", not bad, f"fallas: {bad or '—'}")

        first = rows[0][0]
        page.tap(f"button.m-row[data-index='{first}']")
        settle(page, 450)
        page.keyboard.press("Escape")
        settle(page, 450)
        esc_ok = not sheet_open(page)
        page.tap(f"button.m-row[data-index='{first}']")
        settle(page, 450)
        page.go_back()
        settle(page, 450)
        back_ok = not sheet_open(page) and page.url.startswith(url) and page.locator(".m-card").is_visible()
        check("3b. Esc y Atrás del navegador cierran la hoja (sin salir del sitio)", esc_ok and back_ok,
              f"Esc={esc_ok}, Atrás={back_ok}")

        # 3c. En Sobre mí, la cifra de certificaciones lleva a esa sección (móvil y escritorio)
        about = page.evaluate("ITEMS.findIndex(i => i.id === 'about')")
        page.tap(f"button.m-row[data-index='{about}']")
        settle(page, 450)
        page.tap("#mSheetBody .stat.is-link[data-goto='certifications']")
        settle(page, 450)
        cert_label = page.evaluate("ITEMS.find(i => i.id === 'certifications').label")
        m_ok = sheet_open(page) and page.text_content("#mSheetTitle") == cert_label
        page.tap("#mBack")
        settle(page, 450)
        m_ok = m_ok and not sheet_open(page)
        desk = browser.new_page(viewport={"width": 1440, "height": 900})
        desk.goto(url, wait_until="networkidle")
        desk.evaluate(f"goTo({about}); openPanel()")
        settle(desk, 900)
        desk.click("#panelBody .stat.is-link[data-goto='certifications']")
        settle(desk, 1200)
        d_ok = desk.text_content("#panelTitle") == cert_label and desk.evaluate("isOpen")
        desk.close()
        check("3c. «Sobre mí»: la cifra de certificaciones lleva a Certificaciones", m_ok and d_ok,
              f"móvil={m_ok}, escritorio={d_ok}")

        # 4. Enlaces directos de Contacto
        hrefs = page.eval_on_selector_all("a.m-row", "els => els.map(a => a.getAttribute('href'))")
        check("4. Correo y GitHub como enlaces directos en la tarjeta",
              "mailto:villamil76@gmail.com" in hrefs and "https://github.com/Rprimero93" in hrefs, str(hrefs))
        check("6c. Teléfono ausente en la página móvil", not has_phone(page.content()))
        check("   Sin errores en consola (recorrido completo)", not errors, "; ".join(errors))
        ctx.close()

        # 2b. Agregar una opción en data.js la muestra en la tarjeta
        ctx, page, errors = phone(browser)
        original = (ROOT / "data.js").read_text(encoding="utf-8")
        extra = ("PORTFOLIO.items.push({ id: 'extra', label: 'Opción extra', icon: 'folder', desc: 'Prueba.', "
                 "content: { type: 'list', sections: [[null, [['Uno', 'A'], ['Dos', 'B']]]] } });")
        page.route("**/data.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=original + "\n" + extra))
        page.goto(url, wait_until="networkidle")
        settle(page)
        row = page.locator("button.m-row[data-id='extra']")
        extra_ok = row.count() == 1 and row.locator(".m-count").text_content() == "2" \
            and page.text_content("#mCount") == "9 secciones"
        check("2b. Agregar una opción en data.js la muestra en la tarjeta", extra_ok and not errors,
              f"fila={row.count()}, errores={errors or '—'}")
        ctx.close()

        # 6a. Doble clic (file://)
        ctx, page, errors = phone(browser)
        page.goto((ROOT / "index.html").as_uri())
        settle(page)
        page.tap("button.m-row[data-index='1']")
        settle(page, 450)
        file_open = sheet_open(page)
        page.tap("#mBack")
        settle(page, 450)
        check("6a. Funciona abriendo index.html con doble clic (file://)",
              file_open and not sheet_open(page) and not errors, "; ".join(errors))
        ctx.close()

        # 6b. Movimiento reducido: la hoja y las filas sin transición, la tarjeta sin animación
        ctx, page, errors = phone(browser, reduced_motion="reduce")
        page.goto(url, wait_until="networkidle")
        motion = page.evaluate("""() => [getComputedStyle(document.getElementById('mSheet')).transitionDuration,
            getComputedStyle(document.querySelector('.m-card')).animationName]""")
        check("6b. Respeta prefers-reduced-motion", motion[0].split(",")[0].strip() == "0s" and motion[1] == "none", str(motion))
        ctx.close()

        # 7. Sitio publicado
        if live:
            ctx, page, errors = phone(browser)
            page.goto(LIVE_URL, wait_until="networkidle")
            settle(page)
            page.tap("button.m-row[data-index='1']")
            settle(page, 450)
            live_ok = page.locator(".m-card").count() == 1 and sheet_open(page) and not has_phone(page.content())
            page.screenshot(path=str(SHOTS / "movil_live.png"))
            check("7. GitHub Pages con la tarjeta-menú móvil", live_ok and not errors, "; ".join(errors))
            ctx.close()

        browser.close()
    httpd.shutdown()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones OK. Capturas en {SHOTS}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
