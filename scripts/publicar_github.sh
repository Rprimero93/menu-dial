#!/usr/bin/env bash
# Publica Menu_Dial como espejo en GitHub (Rprimero93/menu-dial) desde el repo de la bóveda.
# La bóveda sigue siendo la fuente de verdad; este script solo genera y empuja la copia.
#   1. git subtree split: historia de la carpeta del proyecto.
#   2. En una carpeta temporal: correo de autor/committer → noreply de GitHub y fuera tests/__pycache__.
#   3. Push a main (pide autorizar con la cuenta Rprimero93 la primera vez).
# Uso (desde cualquier carpeta):  bash scripts/publicar_github.sh [--dry-run]
set -euo pipefail

PREFIX="Herramientas/Web/Menu_Dial"
REMOTE="https://Rprimero93@github.com/Rprimero93/menu-dial.git"
EMAIL="Rprimero93@users.noreply.github.com"
BRANCH="tmp-menu-dial-publish"
DRY_RUN="${1:-}"

VAULT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"; git -C "$VAULT" branch -D "$BRANCH" >/dev/null 2>&1 || true' EXIT

# git subtree comprueba la ruta del prefijo contra la carpeta actual: se corre desde la raíz
(cd "$VAULT" && git subtree split --prefix="$PREFIX" -b "$BRANCH" >/dev/null)
git clone -q --branch "$BRANCH" --single-branch "$VAULT" "$WORK/repo"
cd "$WORK/repo"
git checkout -q -b main

export FILTER_BRANCH_SQUELCH_WARNING=1
# --tree-filter: además de quitar la caché de Python, reemplaza en el historial la línea con el patrón
# del teléfono que tuvo validar_fase3.py en el commit e2681cc de la bóveda (se ubica por su inicio,
# sin escribir el número aquí); desde el commit siguiente la prueba usa solo una huella SHA-256.
git filter-branch -f \
  --env-filter "export GIT_AUTHOR_EMAIL='$EMAIL'; export GIT_COMMITTER_EMAIL='$EMAIL'" \
  --tree-filter 'rm -rf tests/__pycache__;
    if [ -f tests/validar_fase3.py ]; then
      sed -i -E "s/^PHONE = re\.compile\(.*$/PHONE = re.compile(r\"(?!)\")  # patrón retirado del historial publicado/" tests/validar_fase3.py;
    fi' \
  -- main >/dev/null

# Control de privacidad: si algún commit del historial a publicar contiene el teléfono, no se empuja.
# Compara la huella SHA-256 de cada secuencia de 10 dígitos (la misma de tests/validar_fase3.py).
rm -rf .git/refs/original  # respaldo de filter-branch: no se publica
git log -p main | python -c '
import hashlib, re, sys
SHA = "562e626c4919d5c554fd8ce9ad82888c05812d0e95403aa22bb51ba9e5083dad"
d = re.sub(r"\D", "", sys.stdin.buffer.read().decode("utf-8", "ignore"))
hit = any(hashlib.sha256(d[i:i + 10].encode()).hexdigest() == SHA for i in range(len(d) - 9))
print("Control de privacidad:", "FALLA, se encontró el teléfono" if hit else "OK, sin teléfono en el historial")
sys.exit(1 if hit else 0)'

echo "Commit a publicar: $(git log -1 --format='%h %s')"
if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "Remoto actual:     $(git ls-remote "$REMOTE" refs/heads/main | cut -c1-7)"
  echo "(ensayo: no se empujó nada)"
else
  git push "$REMOTE" main:main
fi
