"""Validación de la Fase 6 de Menu_Dial (al día con el portafolio PDF y foto de perfil) con Playwright + Edge.

Revisa en escritorio (1440 px) y en celular emulado (390 y 360 px): tarjeta de perfil con foto, sección «Motion
graphics» con sus 9 videos, «Plan de pagos 2026» en Proyectos, viñetas numeradas, etiquetas con ícono y Behance en
Contacto; que todo salga de data.js; doble clic (file://), movimiento reducido, privacidad y la compatibilidad de
data.js con el portafolio PDF que también lo lee. Corre antes la validación de la Fase 4 (que incluye la 1, 2 y 3).
Uso:  python tests/validar_fase6.py [--live]
"""
import json
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validar_fase1 import ROOT, SHOTS, serve  # noqa: E402
from validar_fase3 import LIVE_URL  # noqa: E402
from validar_fase4 import phone, settle, sheet_open  # noqa: E402

results = []
BEHANCE = "https://www.behance.net/gallery/258535135/Portafolio-2026"


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"[{'OK' if ok else 'FALLA'}] {name}{' — ' + detail if detail else ''}")


def load_portfolio():
    """data.js como objeto (con Node, igual que jsx/ejecutar.ps1 del portafolio PDF)."""
    js = ("const fs=require('fs');eval(fs.readFileSync(process.argv[1],'utf8')+';globalThis.P=PORTFOLIO');"
          "process.stdout.write(JSON.stringify(globalThis.P))")
    out = subprocess.run(["node", "-e", js, str(ROOT / "data.js")], capture_output=True, text=True, encoding="utf-8")
    return json.loads(out.stdout)


def desk_page(browser, **kw):
    page = browser.new_page(viewport={"width": 1440, "height": 900}, **kw)
    errors = []
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    page.on("pageerror", lambda e: errors.append(str(e)))
    return page, errors


def open_section(page, sid):
    page.evaluate(f"goTo(ITEMS.findIndex(i => i.id === '{sid}')); openPanel()")
    page.wait_for_function("shift === shiftTarget", timeout=3000)
    settle(page, 900)


def images_ok(page, sel):
    return page.eval_on_selector_all(sel, "els => els.length > 0 && els.every(i => i.complete && i.naturalWidth > 0)")


def main():
    live = "--live" in sys.argv
    P = load_portfolio()
    ids = [it["id"] for it in P["items"]]

    # 3. Regresión: Fase 4 (que corre la 3, la 2 y la 1)
    fase4 = subprocess.run([sys.executable, str(Path(__file__).with_name("validar_fase4.py"))],
                           capture_output=True, text=True, encoding="utf-8")
    lines = (fase4.stdout or "").strip().splitlines()
    detail = next((l for l in reversed(lines) if "comprobaciones OK" in l), (fase4.stderr or "")[-300:])
    check("3. Validaciones de las Fases 1-4 sin regresiones", fase4.returncode == 0, detail)

    # 2c. Compatibilidad con el portafolio PDF (lee este data.js: jsx/ejecutar.ps1)
    projects = next(it for it in P["items"] if it["id"] == "projects")["content"]["rows"]
    contact = next(it for it in P["items"] if it["id"] == "contact")["content"]
    pdf_ok = {
        "Sobre mí en items[0]": ids[0] == "about",
        "Logros en items[5] (paso 4)": ids[5] == "achievements",
        "una sola tarjeta con «ESAP» en el nombre (paso 9)": sum("ESAP" in r["name"] for r in projects) == 1,
        "una sola con «Los Coches» (paso 13)": sum("Los Coches" in r["name"] for r in projects) == 1,
        "contact.rows solo ubicación/correo/teléfono (paso 15)": {r[0] for r in contact["rows"]} <= {"mapPin", "mail", "phone"},
    }
    check("2c. data.js sigue siendo compatible con el portafolio PDF", all(pdf_ok.values()),
          ", ".join(k for k, v in pdf_ok.items() if not v) or "5/5")

    # 4c. Privacidad: sin PDF en lo que se publica; recursos livianos
    files = subprocess.run(["git", "ls-files", "--others", "--cached", "--exclude-standard"], cwd=ROOT,
                           capture_output=True, text=True).stdout.split()
    motion_mb = sum(f.stat().st_size for f in (ROOT / "assets" / "motion").iterdir()) / 1e6
    check("4c. Privacidad: sin PDF en la copia; videos livianos",
          not any(f.lower().endswith(".pdf") for f in files) and motion_mb < 3, f"assets/motion = {motion_mb:.1f} MB")

    httpd = serve()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")

        # ---------- Escritorio ----------
        page, errors = desk_page(browser)
        page.goto(url, wait_until="networkidle")
        settle(page)

        # 1a. Sobre mí: tarjeta con foto, insignia, cifras con ícono y botón Escríbeme
        open_section(page, "about")
        hero = page.evaluate("""() => {
            const c = document.querySelector('#panelBody .hero-card');
            const b = c?.getBoundingClientRect(), p = document.getElementById('panelBody').getBoundingClientRect();
            return { card: !!c, badge: !!c?.querySelector('.hero-verified'),
                     icons: c?.querySelectorAll('.stat i svg').length || 0,
                     btn: c?.querySelector('.hero-btn')?.getAttribute('href'),
                     fits: !!b && b.bottom <= p.bottom + 1 };
        }""")
        page.screenshot(path=str(SHOTS / "f6_sobre_mi_1440.png"))
        check("1a. Escritorio: «Sobre mí» con foto, insignia, cifras con ícono y botón (entra en el panel)",
              hero["card"] and images_ok(page, "#panelBody .hero-photo") and hero["badge"] and hero["icons"] == 3
              and hero["btn"] == "mailto:villamil76@gmail.com" and hero["fits"], str(hero))

        # 1b. Proyectos: Plan de pagos entre Los Coches y la ESAP, viñetas numeradas, etiquetas con ícono
        open_section(page, "projects")
        names = page.eval_on_selector_all("#panelBody .project-head strong", "els => els.map(e => e.textContent)")
        nums = page.eval_on_selector_all("#panelBody .is-numbered", "ols => ols.map(o => [...o.querySelectorAll('.pt-n')].map(n => n.textContent).join(','))")
        chips = page.eval_on_selector_all("#panelBody .project .chip", "els => els.map(e => e.classList.contains('has-icon'))")
        order_ok = len(names) == 3 and "Los Coches" in names[0] and names[1] == "Plan de pagos 2026" and "ESAP" in names[2]
        page.screenshot(path=str(SHOTS / "f6_proyectos_1440.png"))
        check("1b. Proyectos: Plan de pagos 2026 después de Los Coches; numeración 01-04 y 01-06",
              order_ok and nums == ["01,02,03,04", "01,02,03,04,05,06"], f"{names} · {nums}")
        check("   Etiquetas de Proyectos con su ícono", chips and all(chips)
              and images_ok(page, "#panelBody .chip img"), f"{sum(chips)}/{len(chips)}")

        # 1c. Motion graphics: 9 videos con póster, nombre y duración; se reproducen al verse
        open_section(page, "motion")
        page.wait_for_timeout(1500)
        mo = page.evaluate("""() => {
            const v = [...document.querySelectorAll('#panelBody video')];
            return { n: v.length, posters: v.every(x => x.poster), playing: v.filter(x => !x.paused && x.currentTime > 0).length,
                     caps: [...document.querySelectorAll('#panelBody figcaption')].every(f => / s$/.test(f.textContent.trim())) };
        }""")
        page.screenshot(path=str(SHOTS / "f6_motion_1440.png"))
        check("1c. Escritorio: «Motion graphics» con 9 piezas (póster, nombre, duración) que se reproducen al verse",
              mo["n"] == 9 and mo["posters"] and mo["caps"] and mo["playing"] >= 1, str(mo))

        # 1d. Behance en Contacto
        open_section(page, "contact")
        hrefs = page.eval_on_selector_all("#panelBody a", "els => els.map(a => a.getAttribute('href'))")
        check("1d. Escritorio: Behance en Contacto (además de correo y teléfono)", BEHANCE in hrefs and len(hrefs) == 3, str(hrefs))
        check("   Escritorio sin errores en consola", not errors, "; ".join(errors))
        page.close()

        # 2a. La sección nueva sale de data.js: anillo, lista y conteo
        page, errors = desk_page(browser)
        page.goto(url, wait_until="networkidle")
        ring = page.evaluate("[document.querySelectorAll('.segment').length, document.querySelectorAll('.option').length, N]")
        check("2a. «Motion graphics» en el anillo y la lista desde data.js", ring == [len(ids)] * 3 and "motion" in ids, str(ring))
        page.close()

        # 2b. Agregar una pieza en data.js la muestra (sin tocar el JS)
        original = (ROOT / "data.js").read_text(encoding="utf-8")
        extra = "PORTFOLIO.items.find(i => i.id === 'motion').content.series[1].pieces.push(['Extra', 5, 'puntos']);"
        ctx, mpage, merrors = phone(browser)
        mpage.route("**/data.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=original + "\n" + extra))
        mpage.goto(url, wait_until="networkidle")
        settle(mpage)
        cnt = mpage.text_content("button.m-row[data-id='motion'] .m-count")
        mpage.tap("button.m-row[data-id='motion']")
        settle(mpage, 500)
        n_vid = mpage.locator("#mSheetBody video").count()
        check("2b. Agregar una pieza en data.js la muestra en la tarjeta y la hoja", cnt == "10" and n_vid == 10 and not merrors,
              f"conteo={cnt}, videos={n_vid}")
        ctx.close()

        # ---------- Celular ----------
        for w, h in [(390, 844), (360, 640)]:
            ctx, mpage, merrors = phone(browser, w, h)
            mpage.goto(url, wait_until="networkidle")
            settle(mpage)
            avatar = images_ok(mpage, ".m-head .profile-avatar.has-photo img")
            direct = mpage.eval_on_selector_all("a.m-row", "els => els.map(a => a.getAttribute('href'))")
            mpage.screenshot(path=str(SHOTS / f"f6_movil_tarjeta_{w}.png"), full_page=True)
            mpage.tap("button.m-row[data-id='about']")
            settle(mpage, 600)
            card = mpage.evaluate("""() => { const b = document.querySelector('#mSheetBody .hero-card').getBoundingClientRect();
                return b.left >= 0 && b.right <= innerWidth && b.height > b.width; }""")
            photo = images_ok(mpage, "#mSheetBody .hero-photo")
            mpage.screenshot(path=str(SHOTS / f"f6_movil_sobre_mi_{w}.png"))
            mpage.tap("#mBack")
            settle(mpage, 450)
            mpage.tap("button.m-row[data-id='motion']")
            settle(mpage, 1500)
            cols = mpage.evaluate("""() => new Set([...document.querySelectorAll('#mSheetBody .mo-series:first-child .mo-piece')]
                .map(f => Math.round(f.getBoundingClientRect().left))).size""")
            playing = mpage.evaluate("[...document.querySelectorAll('#mSheetBody video')].some(v => !v.paused)")
            mpage.screenshot(path=str(SHOTS / f"f6_movil_motion_{w}.png"))
            overflow = mpage.evaluate("document.documentElement.scrollWidth > innerWidth")
            check(f"1e. {w} px: foto en el encabezado y en «Sobre mí» (vertical), Motion en 3 columnas, Behance directo",
                  avatar and card and photo and cols == 3 and playing and BEHANCE in direct and not overflow and not merrors,
                  f"avatar={avatar}, tarjeta={card}, foto={photo}, columnas={cols}, reproduce={playing}, errores={merrors or '—'}")
            ctx.close()

        # 4a. Doble clic (file://): foto y videos cargan
        page, errors = desk_page(browser)
        page.goto((ROOT / "index.html").as_uri())
        settle(page)
        open_section(page, "about")
        photo = images_ok(page, "#panelBody .hero-photo")
        open_section(page, "motion")
        page.wait_for_timeout(1500)
        ready = page.evaluate("[...document.querySelectorAll('#panelBody video')].some(v => v.readyState >= 2)")
        check("4a. Funciona con doble clic (file://): foto y videos", photo and ready and not errors,
              f"foto={photo}, video={ready}, errores={errors or '—'}")
        page.close()

        # 4b. Movimiento reducido: los videos no se reproducen solos y tienen controles
        page, errors = desk_page(browser, reduced_motion="reduce")
        page.goto(url, wait_until="networkidle")
        open_section(page, "motion")
        page.wait_for_timeout(1200)
        rm = page.evaluate("""() => { const v = [...document.querySelectorAll('#panelBody video')];
            return [v.every(x => x.paused), v.every(x => x.controls)]; }""")
        check("4b. prefers-reduced-motion: videos quietos y con controles", rm == [True, True], str(rm))
        page.close()

        # 5. Sitio publicado
        if live:
            page, errors = desk_page(browser)
            page.goto(LIVE_URL, wait_until="networkidle")
            settle(page)
            open_section(page, "about")
            photo = images_ok(page, "#panelBody .hero-photo")
            open_section(page, "motion")
            page.wait_for_timeout(2000)
            n = page.locator("#panelBody video").count()
            ready = page.evaluate("[...document.querySelectorAll('#panelBody video')].some(v => v.readyState >= 2)")
            page.screenshot(path=str(SHOTS / "f6_live.png"))
            check("5. GitHub Pages con la foto y Motion graphics", photo and n == 9 and ready and not errors,
                  f"foto={photo}, videos={n}, carga={ready}, errores={errors or '—'}")
            page.close()

        browser.close()
    httpd.shutdown()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones OK. Capturas en {SHOTS}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
