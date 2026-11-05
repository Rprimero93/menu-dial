"""Validación de la Fase 3 de Menu_Dial (contenido real desde la hoja de vida) con Playwright + Edge.

Corre primero la validación de la Fase 2 (que a su vez corre la de la Fase 1) y luego revisa:
contenido separado en data.js, fidelidad con la hoja de vida, apertura con doble clic (file://),
privacidad de lo publicado y capturas. Con --live revisa además el sitio en GitHub Pages.
Uso:  python tests/validar_fase3.py [--live]
"""
import hashlib
import re
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validar_fase1 import ROOT, SHOTS, serve, wait_settle  # noqa: E402

LIVE_URL = "https://rprimero93.github.io/menu-dial/"
results = []

# Textos que deben aparecer en cada panel (por id, así no depende del orden de data.js),
# tomados de HojaDeVida_Ricardo_Villamil_2026.pdf
EXPECTED = {
    # Sobre mí: redacción propia del usuario (2026-11-05). Desde el ajuste de la Fase 4 es una tarjeta de
    # perfil con cifras y botones (antes: "+9 años" y "8.º semestre" en tarjetas de datos)
    "about": ["más de 9 años", "años de experiencia", "Bogotá, Colombia", "Escríbeme"],
    "experience": ["Coordinador Wallbox", "Los Coches S.A.S.", "Mar 2026 – Ago 2026",
        "Automatizador de Procesos", "Dic 2020 – Dic 2025", "Frontdesk", "Ene 2020 – May 2020",
        "Selcomp (Proyecto Capital Salud)", "Jun 2018 – Nov 2019",
        "Secretaría de Gobierno de Bogotá", "Dic 2016 – Abr 2018"],
    "achievements": ["87,5 %", "4 horas", "30 minutos", "21", "+9 años"],
    "skills": ["Power Automate", "SharePoint", "VBA", "Power BI", "Python", "ITIL 4", "ISO 27001 (SGSI)",
        "ISO 19011", "Scrum", "Seguimiento de cronograma (SPI)", "Interventoría"],
    "education": ["Ingeniería de Sistemas", "Fundación Universitaria San José", "8.º semestre",
        "Fundación Politécnica Tequendama (Fundesa)", "SENA", "Gerencia de Proyectos",
        "Interventoría y Auditoría de Proyectos", "ISO 19011:2018", "Politécnico de Colombia"],
    "certifications": ["Auditor ISO 27001 SGSI", "ITIL 4 Foundation", "PeopleCert", "Scrum Foundation Certification (SFC™)",
        "SCRUMstudy", "Project Management Essentials (PME)", "Cyber Security Foundation",
        "Excel Avanzado", "Pontificia Universidad Javeriana",
        "Lean Six Sigma White Belt Professional"],  # agregada por el usuario (no está en la hoja de vida)
    # Proyectos: el usuario quitó Menu Dial y listó las 6 herramientas (2026-11-05)
    "projects": ["6 herramientas web", "Plan de pagos", "GLPI", "Matriz de viáticos", "mantenimiento vehicular"],
    "contact": ["Bogotá, Colombia", "villamil76@gmail.com", "github.com/Rprimero93"],
}
COUNTS = {"about": (".stat", 3), "experience": (".tl-item", 5), "projects": (".project-points li", 10),  # 6 herramientas web + 4 de seguimiento (antes: 6) "certifications": (".entry", 7), "education": (".entry", 6), "skills": (".tag-group", 6)}
# Huella SHA-256 de los 10 dígitos del teléfono: se compara la huella, el número no se escribe aquí
PHONE_SHA = "562e626c4919d5c554fd8ce9ad82888c05812d0e95403aa22bb51ba9e5083dad"


def has_phone(text):
    digits = re.sub(r"\D", "", text)
    return any(hashlib.sha256(digits[i:i + 10].encode()).hexdigest() == PHONE_SHA
               for i in range(len(digits) - 9))


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"[{'OK' if ok else 'FALLA'}] {name}{' — ' + detail if detail else ''}")


def collect_errors(page):
    errors = []
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    page.on("pageerror", lambda e: errors.append(str(e)))
    return errors


def main():
    live = "--live" in sys.argv

    # 4. Regresión: Fase 2 (que incluye la Fase 1)
    fase2 = subprocess.run([sys.executable, str(Path(__file__).with_name("validar_fase2.py"))],
                           capture_output=True, text=True, encoding="utf-8")
    lines = fase2.stdout.strip().splitlines()
    detail = " | ".join(l for l in lines if "comprobaciones OK" in l) or fase2.stderr[-300:]
    check("4. Validaciones de las Fases 1 y 2 sin regresiones", fase2.returncode == 0, detail)

    # 5a. Privacidad de lo que se publica (archivos versionados del proyecto)
    files = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True).stdout.split()
    files += ["data.js"]  # por si todavía no está versionado
    leaks = [f for f in set(files) if (ROOT / f).is_file() and has_phone((ROOT / f).read_text(encoding="utf-8", errors="ignore"))]
    pdfs = [f for f in set(files) if f.lower().endswith(".pdf")]
    check("5a. Ningún archivo publicado contiene el teléfono ni es un PDF", not leaks and not pdfs,
          f"teléfono en: {leaks or '—'}; PDF: {pdfs or '—'}")

    # 1a. Contenido solo en data.js: script.js no contiene datos de la hoja de vida
    script = (ROOT / "script.js").read_text(encoding="utf-8")
    stray = [w for w in ("Wallbox", "villamil76", "CertiProf", "ESAP") if w in script]
    check("1a. El contenido vive solo en data.js", not stray, f"en script.js: {stray or '—'}")

    SHOTS.mkdir(exist_ok=True)
    httpd = serve()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = collect_errors(page)
        page.goto(url, wait_until="networkidle")
        wait_settle(page)

        same = page.evaluate("ITEMS === PORTFOLIO.items")
        head = page.text_content("#headTitle")
        check("1b. ITEMS sale de PORTFOLIO y el encabezado de data.js", same and head == page.evaluate("PORTFOLIO.header.title"), head)
        page.screenshot(path=str(SHOTS / "portafolio_1440.png"))

        # 2. Fidelidad con la hoja de vida, opción por opción
        page.evaluate("openPanel()")
        missing = {}
        index = page.evaluate("Object.fromEntries(ITEMS.map((it, i) => [it.id, i]))")
        for key, words in EXPECTED.items():
            i = index[key]
            page.evaluate(f"goTo({i})")
            wait_settle(page)
            text = page.text_content("#panel")
            html = page.inner_html("#panelBody")
            miss = [w for w in words if w not in text and w not in html]
            if key in COUNTS:
                sel, n = COUNTS[key]
                got = page.locator(f"#panelBody {sel}").count()
                if got != n:
                    miss.append(f"{sel}={got}≠{n}")
            if miss:
                missing[key] = miss
            if key == "experience":
                page.locator("#panel").screenshot(path=str(SHOTS / "panel_experiencia.png"))
        # Habilidades de Sobre mí: tantas como haya en data.js, en lista vertical (una por fila)
        page.evaluate(f"goTo({index['about']})")
        wait_settle(page)
        n_sk = page.evaluate("ITEMS.find(i => i.id === 'about').content.skills.length")
        xs = page.eval_on_selector_all("#panelBody .skill", "els => els.map(e => Math.round(e.getBoundingClientRect().left))")
        ys = page.eval_on_selector_all("#panelBody .skill", "els => els.map(e => Math.round(e.getBoundingClientRect().top))")
        check("   Habilidades destacadas en lista vertical", len(xs) == n_sk and len(set(xs)) == 1 and ys == sorted(set(ys)),
              f"{len(xs)} filas")
        labels = page.evaluate("ITEMS.map(i => i.label)")
        check("2. Las 8 opciones coinciden con la hoja de vida", not missing and len(labels) == 8,
              f"faltantes: {missing}" if missing else ", ".join(labels))

        # Enlaces de Contacto y Proyectos
        page.evaluate(f"goTo({index['contact']})")
        wait_settle(page)
        hrefs = page.eval_on_selector_all("#panelBody a", "els => els.map(a => a.getAttribute('href'))")
        check("   Contacto: correo y GitHub como enlaces",
              "mailto:villamil76@gmail.com" in hrefs and "https://github.com/Rprimero93" in hrefs, str(hrefs))
        body = page.content()
        check("5b. Teléfono y PDF ausentes en la página", not has_phone(body) and ".pdf" not in body.lower())
        page.screenshot(path=str(SHOTS / "panel_contacto_1440.png"))

        page.set_viewport_size({"width": 390, "height": 844})
        wait_settle(page)
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        page.screenshot(path=str(SHOTS / "portafolio_390.png"))
        check("6. 390 px sin scroll horizontal y sin errores en consola", not overflow and not errors, "; ".join(errors))
        page.close()

        # 1c. Agregar o quitar una opción en data.js recalcula anillo y lista
        def with_extra_js(extra):
            pg = browser.new_page(viewport={"width": 1440, "height": 900})
            errs = collect_errors(pg)
            original = (ROOT / "data.js").read_text(encoding="utf-8")
            pg.route("**/data.js", lambda r: r.fulfill(status=200, content_type="text/javascript",
                                                       body=original + "\n" + extra))
            pg.goto(url, wait_until="networkidle")
            wait_settle(pg)
            return pg, errs

        pg, errs = with_extra_js("PORTFOLIO.items.push({ id: 'extra', label: 'Opción extra', icon: 'folder', "
                                 "desc: 'Prueba.', content: { type: 'tags', groups: [['Grupo', ['Uno']]] } });")
        nine = pg.locator(".segment").count() == 9 and pg.locator(".option").count() == 9
        pg.evaluate("goTo(8); openPanel()")
        wait_settle(pg)
        extra_ok = pg.text_content("#panelTitle") == "Opción extra"
        pg.close()
        pg, errs2 = with_extra_js("PORTFOLIO.items.pop();")
        seven = pg.locator(".segment").count() == 7 and pg.locator(".option").count() == 7
        pg.close()
        check("1c. Agregar/quitar una opción en data.js recalcula anillo y lista",
              nine and extra_ok and seven and not errs and not errs2,
              f"9 opciones={nine}, panel extra={extra_ok}, 7 opciones={seven}")

        # 3. Doble clic: abrir index.html como archivo (file://)
        pg = browser.new_page(viewport={"width": 1440, "height": 900})
        errs = collect_errors(pg)
        pg.goto((ROOT / "index.html").as_uri())
        wait_settle(pg)
        pg.click(".option[data-index='1']")
        wait_settle(pg)
        file_ok = pg.evaluate("isOpen") and pg.text_content("#panelTitle") == pg.evaluate("ITEMS[1].label")
        pg.close()
        check("3a. Funciona abriendo index.html con doble clic (file://)", file_ok and not errs, "; ".join(errs))

        # 3b/7. Sitio publicado en GitHub Pages
        if live:
            pg = browser.new_page(viewport={"width": 1440, "height": 900})
            errs = collect_errors(pg)
            pg.goto(LIVE_URL, wait_until="networkidle")
            wait_settle(pg)
            pg.click(".option[data-index='1']")
            wait_settle(pg)
            live_ok = pg.text_content("#headTitle") == pg.evaluate("PORTFOLIO.header.title") and \
                pg.text_content("#panelTitle") == pg.evaluate("ITEMS[1].label")
            live_priv = not has_phone(pg.content())
            pg.close()
            check("3b/7. GitHub Pages publicado con el contenido nuevo", live_ok and live_priv and not errs,
                  "; ".join(errs))

        browser.close()
    httpd.shutdown()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} comprobaciones OK. Capturas en {SHOTS}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
