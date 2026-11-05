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
git filter-branch -f \
  --env-filter "export GIT_AUTHOR_EMAIL='$EMAIL'; export GIT_COMMITTER_EMAIL='$EMAIL'" \
  --index-filter 'git rm -q -r --cached --ignore-unmatch tests/__pycache__' \
  -- main >/dev/null

echo "Commit a publicar: $(git log -1 --format='%h %s')"
if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "Remoto actual:     $(git ls-remote "$REMOTE" refs/heads/main | cut -c1-7)"
  echo "(ensayo: no se empujó nada)"
else
  git push "$REMOTE" main:main
fi
