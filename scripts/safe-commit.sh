#!/usr/bin/env bash
#
# safe-commit.sh
# Pré-vérification avant commit des correctifs sécurité de mission-ia.
# Refuse de continuer si tu n'es pas dans le bon dépôt.
#
# Usage : depuis la racine de ton clone mission-ia
#   bash scripts/safe-commit.sh
#
set -euo pipefail

EXPECTED_REMOTE="DoukyDPA/mission-ia"
EXPECTED_BRANCH="main"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
abort() { red "ARRÊT : $1"; exit 1; }

# 1. Sommes-nous dans un dépôt Git ?
git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || abort "Ce dossier n'est pas un dépôt Git."

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# 2. Le remote 'origin' pointe-t-il bien sur mission-ia ?
ORIGIN_URL="$(git remote get-url origin 2>/dev/null || echo '')"
[ -n "$ORIGIN_URL" ] || abort "Pas de remote 'origin' configuré."

if ! echo "$ORIGIN_URL" | grep -qi "$EXPECTED_REMOTE"; then
  red "Le remote 'origin' est : $ORIGIN_URL"
  abort "Ce n'est pas $EXPECTED_REMOTE. Tu n'es pas dans le bon clone."
fi
green "OK : dépôt $EXPECTED_REMOTE confirmé."
echo "  Racine : $ROOT"

# 3. Branche attendue ?
BRANCH="$(git branch --show-current)"
if [ "$BRANCH" != "$EXPECTED_BRANCH" ]; then
  red "Branche courante : $BRANCH (attendu : $EXPECTED_BRANCH)"
  abort "Bascule sur '$EXPECTED_BRANCH' ou ajuste le script si c'est voulu."
fi
green "OK : branche $BRANCH."

# 4. .env.local ne doit jamais être suivi.
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  abort ".env.local est suivi par Git. Retire-le d'abord : git rm --cached .env.local"
fi

# 5. Fichiers de la livraison sécurité (on n'ajoute que ceux qui existent).
FILES=(
  ".gitignore"
  ".env.example"
  "SECURITY.md"
  "src/lib/rateLimit.ts"
  "src/lib/supabaseServer.ts"
  "src/lib/sanitize.ts"
  "supabase/rls_policies.sql"
  "supabase/audit_logs.sql"
  "src/app/api/optimize-prompt/route.ts"
  "src/components/dashboard/PromptAssistant.tsx"
  "src/components/dashboard/Dashboard.tsx"
  "package.json"
  "package-lock.json"
)

TO_ADD=()
for f in "${FILES[@]}"; do
  if [ -e "$f" ]; then
    TO_ADD+=("$f")
  else
    red "  (absent, ignoré) $f"
  fi
done

[ "${#TO_ADD[@]}" -gt 0 ] || abort "Aucun fichier attendu trouvé. Es-tu à la racine du projet ?"

echo
green "Fichiers qui seront indexés :"
printf '  %s\n' "${TO_ADD[@]}"

git add -- "${TO_ADD[@]}"

echo
green "Récapitulatif (git status) :"
git status --short

echo
green "Diff résumé (git diff --cached --stat) :"
git diff --cached --stat

cat <<'EOF'

------------------------------------------------------------
Vérification terminée. Rien n'a encore été committé.
Si tout est correct, lance toi-même :

  git commit -m "Sécurité DICP : auth + rate limit API, sanitisation XSS, durcissement RLS, audit logs"
  git push origin main      # JAMAIS --force

Si le push est refusé (remote en avance) :
  git pull --rebase origin main
  git push origin main
------------------------------------------------------------
EOF
