#!/usr/bin/env bash
#
# push-mission-ia.sh
# Envoie le code vers UN dépôt précis : DoukyDPA/mission-ia, branche main.
# Double verrou anti-erreur :
#   - refuse si le dossier n'est pas l'appli mission-ia (signature package.json)
#   - refuse si le remote 'origin' n'est pas le bon dépôt
#
# Usage :
#   bash scripts/push-mission-ia.sh "mon message de commit"
#   (si pas de message, un message horodaté est utilisé)
#
set -euo pipefail

# --- Cible verrouillée ---
REPO_URL="https://github.com/DoukyDPA/mission-ia.git"
REPO_SLUG="DoukyDPA/mission-ia"
BRANCH="main"
APP_NAME="mission-ia"   # doit correspondre au champ "name" de package.json

MSG="${1:-"Mise à jour ${APP_NAME} ($(date '+%Y-%m-%d %H:%M'))"}"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
abort() { red "ARRÊT : $1"; exit 1; }

# --- Verrou 1 : sommes-nous bien dans l'appli mission-ia ? ---
[ -f package.json ] || abort "Pas de package.json ici. Lance le script à la racine du projet."
if ! grep -Eq "\"name\"[[:space:]]*:[[:space:]]*\"${APP_NAME}\"" package.json; then
  abort "package.json ne porte pas le nom '${APP_NAME}'. Mauvais dossier, refus."
fi
green "OK : dossier de l'appli '${APP_NAME}' confirmé."

# --- Bootstrap : si ce n'est pas encore un dépôt Git, on le relie au bon remote ---
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  red "Ce dossier n'est pas encore un dépôt Git."
  green "Initialisation et liaison à ${REPO_SLUG}..."
  git init -b "$BRANCH"
  git remote add origin "$REPO_URL"
  git fetch origin "$BRANCH"
  # Adopte l'historique distant : l'index est aligné sur origin/main,
  # le répertoire de travail (tes fichiers) n'est pas touché. Git montre
  # alors seulement les VRAIES différences entre tes fichiers et le distant.
  git reset --mixed "origin/${BRANCH}"
  echo
  red "Bootstrap terminé. ATTENTION : vérifie le statut ci-dessous avant tout commit."
  red "Si des fichiers présents sur GitHub apparaissent comme 'deleted', c'est que"
  red "ton dossier local est incomplet : NE COMMIT PAS, repars d'un clone frais."
  echo
  git status --short
  cat <<EOF

Relance ce script une fois le statut vérifié pour committer et pousser :
  bash scripts/push-mission-ia.sh "ton message"
EOF
  exit 0
fi

# --- Verrou 2 : le remote est-il le bon dépôt ? ---
ORIGIN_URL="$(git remote get-url origin 2>/dev/null || echo '')"
[ -n "$ORIGIN_URL" ] || abort "Aucun remote 'origin'. Configure-le : git remote add origin ${REPO_URL}"
if ! echo "$ORIGIN_URL" | grep -qi "$REPO_SLUG"; then
  red "Le remote 'origin' est : $ORIGIN_URL"
  abort "Ce n'est pas ${REPO_SLUG}. Refus de pousser."
fi
green "OK : remote ${REPO_SLUG} confirmé."

# --- Branche ---
CURRENT_BRANCH="$(git branch --show-current)"
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  abort "Tu es sur '${CURRENT_BRANCH}', pas '${BRANCH}'. Bascule avant de pousser."
fi

# --- Garde-fou : .env.local ne doit jamais partir ---
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  abort ".env.local est suivi par Git. Retire-le : git rm --cached .env.local"
fi

# --- Indexation, commit, synchro, push ---
git add -A
git status --short

if git diff --cached --quiet; then
  green "Rien à committer, tout est déjà à jour."
  exit 0
fi

echo
green "Commit : ${MSG}"
git commit -m "$MSG"

# Récupère d'abord l'éventuelle avance distante (jamais de --force).
green "Synchronisation avec origin/${BRANCH} (rebase)..."
git pull --rebase origin "$BRANCH"

green "Envoi vers ${REPO_SLUG} (${BRANCH})..."
git push origin "$BRANCH"

green "Terminé."
