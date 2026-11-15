"""Prepara los recursos de la Fase 6 en assets/ desde sus fuentes, sin modificarlas (Regla 3: se copian).

  - assets/perfil.webp: foto de perfil (fondo transparente) del portafolio PDF, con el margen vacío de arriba recortado.
  - assets/tech/<nombre>.png: íconos de tecnologías (los mismos del PDF, 96 px).
  - assets/motion/<clave>.mp4 + .jpg: las 9 piezas de Entregables/Motion reducidas a 360 × 640 (sin audio, en bucle
    desde la web) y su póster (el cuadro clave elegido con el usuario para el PDF).
  - assets/entidades/<clave>.svg|png: logos de las entidades certificadoras (los mismos del paso 7 del PDF), recortados
    a su símbolo para usarlos como ícono en «Certificaciones».

Uso:  python scripts/preparar_assets.py            (todo)
      python scripts/preparar_assets.py entidades  (solo uno o varios pasos: foto, tech, motion, entidades)
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
BOVEDA = RAIZ.parents[2]
PDF = BOVEDA / "Entregables" / "Illustrator" / "Portafolio_Menu_Dial"
MOTION = BOVEDA / "Entregables" / "Motion"
ASSETS = RAIZ / "assets"

# Íconos: [archivo en el PDF, nombre en assets/tech]
TECH = [["Excel.png", "excel"], ["Sharepoint.png", "sharepoint"], ["Power automate.png", "power-automate"],
        ["html.png", "html"], ["css.png", "css"], ["javascript.png", "javascript"], ["python.png", "python"],
        ["programming.png", "vba"]]

# Piezas: [clave (igual que salida/motion/piezas.json del PDF), MP4 final en Entregables/Motion]
PIEZAS = [
    ["puntos", "Logo_ESAP_Puntos/salida/final/logo_esap_puntos.mp4"],
    ["particulas", "Logo_ESAP_Particulas/salida/final/logo_esap_particulas.mp4"],
    ["radio", "Logo_ESAP_Particulas/salida/final/logo_radio_esap.mp4"],
    ["radio_oscuro", "Logo_ESAP_Particulas/salida/final/logo_radio_esap_oscuro.mp4"],
    ["rebote", "Logo_ESAP_Rebote/salida/final/logo_esap_rebote.mp4"],
    ["gotas", "Logo_ESAP_Gotas/salida/final/logo_esap_gotas.mp4"],
    ["pixeles", "Radio_ESAP_Pixeles/salida/final/radio_esap_pixeles.mp4"],
    ["formas", "Logo_ESAP_Formas/salida/final/logo_esap_formas.mp4"],
    ["fuegos", "Logo_ESAP_Fuegos/salida/final/logo_esap_fuegos.mp4"],
]

# Logos de entidades: [archivo en el PDF, clave en assets/entidades, recorte al símbolo]
# SVG: nuevo viewBox (x y ancho alto, en unidades del original); PNG: caja de píxeles (izq, arriba, der, abajo).
# Javeriana: solo el escudo, sin el nombre; ITIL: solo el símbolo, sin la palabra; SCRUMstudy: solo el círculo con el check.
ENTIDADES = [
    ["Javeriana.svg", "javeriana", "83 15 434 421"],
    ["certiprof.svg", "certiprof", None],
    ["itil-logo-svg.svg", "itil", "0 0 110 101"],
    # La punta del check sobresale por encima de la «S»: se recorta hasta x = 43 y se borra la zona del texto (x ≥ 33, y ≥ 8)
    ["Scrum.png", "scrumstudy", (0, 0, 43, 33), (33, 8, 43, 33)],
]


def foto():
    im = Image.open(PDF / "imagenes" / "imagen corporativa.png").convert("RGBA")
    top = max(0, im.split()[-1].getbbox()[1] - 40)  # deja 40 px de aire sobre el pelo
    im.crop((0, top, im.width, im.height)).save(ASSETS / "perfil.webp", quality=90, method=6)
    print(f"perfil.webp: {im.width} × {im.height - top} px")


def tech():
    (ASSETS / "tech").mkdir(exist_ok=True)
    for src, nombre in TECH:
        shutil.copyfile(PDF / "imagenes" / src, ASSETS / "tech" / f"{nombre}.png")
    print(f"tech: {len(TECH)} íconos")


def motion():
    (ASSETS / "motion").mkdir(exist_ok=True)
    total = 0
    for clave, rel in PIEZAS:
        mp4 = ASSETS / "motion" / f"{clave}.mp4"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(MOTION / rel), "-an",
                        "-vf", "scale=360:640:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "28",
                        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(mp4)], check=True)
        poster = Image.open(PDF / "salida" / "motion" / f"{clave}.png").convert("RGB").resize((360, 640), Image.LANCZOS)
        poster.save(ASSETS / "motion" / f"{clave}.jpg", quality=82)
        total += mp4.stat().st_size + (ASSETS / "motion" / f"{clave}.jpg").stat().st_size
    print(f"motion: {len(PIEZAS)} piezas, {total / 1e6:.1f} MB en total")


def entidades():
    (ASSETS / "entidades").mkdir(exist_ok=True)
    for src, clave, recorte, *resto in ENTIDADES:
        borrar = resto[0] if resto else None  # zona a dejar transparente (solo PNG)
        if src.endswith(".svg"):
            svg = (PDF / "imagenes" / src).read_text(encoding="utf-8")
            # Sin tamaño fijo ni deformación: el tamaño lo pone la hoja de estilos
            # Solo dentro de la etiqueta <svg> raíz (los elementos internos conservan sus medidas)
            i = svg.index("<svg")
            j = svg.index(">", i)
            raiz = re.sub(r'\s(width|height|preserveAspectRatio)="[^"]*"', "", svg[i:j])
            if recorte:
                raiz = re.sub(r'viewBox="[^"]*"', f'viewBox="{recorte}"', raiz)
            svg = svg[:i] + raiz + svg[j:]
            (ASSETS / "entidades" / f"{clave}.svg").write_text(svg, encoding="utf-8")
        else:
            im = Image.open(PDF / "imagenes" / src).convert("RGBA").crop(recorte)
            if borrar:
                im.paste((0, 0, 0, 0), borrar)
            im.save(ASSETS / "entidades" / f"{clave}.png")
    print(f"entidades: {len(ENTIDADES)} logos")


if __name__ == "__main__":
    pasos = {"foto": foto, "tech": tech, "motion": motion, "entidades": entidades}
    for nombre in (sys.argv[1:] or pasos):
        pasos[nombre]()
