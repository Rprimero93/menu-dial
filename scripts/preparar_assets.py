"""Prepara los recursos de la Fase 6 en assets/ desde sus fuentes, sin modificarlas (Regla 3: se copian).

  - assets/perfil.webp: foto de perfil (fondo transparente) del portafolio PDF, con el margen vacío de arriba recortado.
  - assets/tech/<nombre>.png: íconos de tecnologías (los mismos del PDF, 96 px).
  - assets/motion/<clave>.mp4 + .jpg: las 9 piezas de Entregables/Motion reducidas a 360 × 640 (sin audio, en bucle
    desde la web) y su póster (el cuadro clave elegido con el usuario para el PDF).

Uso:  python scripts/preparar_assets.py
"""
import shutil
import subprocess
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


if __name__ == "__main__":
    foto()
    tech()
    motion()
