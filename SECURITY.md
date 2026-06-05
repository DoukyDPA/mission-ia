# Sécurité, audit DICP

Suivi des correctifs appliqués au projet et des actions qui restent manuelles.

## Ce qui a été corrigé dans le code

**Disponibilité**
- Route `/api/optimize-prompt` protégée par authentification : un appel sans
  session Supabase valide est rejeté (401).
- Rate limiting par utilisateur (`src/lib/rateLimit.ts`) : 10 requêtes par
  minute, pour protéger le quota Mistral.
- Timeout de 25 s sur l'appel Mistral (coupe-circuit), erreurs renvoyées en
  504/502 plutôt que de laisser la fonction bloquée.

**Intégrité**
- XSS stocké fermé : `cleanHtmlContent` utilise maintenant DOMPurify
  (`src/lib/sanitize.ts`) avec une allowlist stricte, à la place du simple
  retrait de `style=`.
- Validation des entrées de la route IA : type contrôlé, intention limitée à
  4000 caractères.
- Garde anti-injection : l'intention utilisateur est isolée entre balises
  `<intention>` et le prompt système ignore toute consigne qu'elle contient.

**Confidentialité**
- `.gitignore` ajouté : `.env*` n'est plus versionnable.
- `.env.example` fourni comme gabarit sans secret.
- La route IA ne renvoie plus les messages d'erreur Mistral bruts au client
  (détails uniquement dans les logs serveur).

**Preuve et traçabilité**
- `supabase/audit_logs.sql` : table d'audit en écriture seule + triggers sur
  `profiles`, `structures`, `allowed_domains`.

## Déjà appliqué en base (Supabase, projet Mission-ia)

- **RLS durci** (migration `security_rls_hardening`) : escalade de rôle
  bloquée par trigger, insert/delete de structures et domaines réservés à
  l'admin, lecture anonyme coupée sur `prompts` et `resources`.
- **Audit** (migration `audit_logs_traceability`) : table `audit_logs` en
  écriture seule + triggers sur `profiles`, `structures`, `allowed_domains`.
- **Fonctions SECURITY DEFINER durcies** (migration
  `security_definer_hardening`) : EXECUTE révoqué pour anon/authenticated sur
  les fonctions trigger, `search_path` épinglé.

Scan sécurité Supabase passé de 12 à 4 alertes (les 4 restantes ci-dessous).

## Actions manuelles à faire (hors code)

1. **Clés API.** Déplacer les vraies valeurs vers les variables
   d'environnement de l'hébergeur (Vercel). Supprimer `.env.local` du poste
   partagé. Par prudence, régénérer la clé Mistral si un doute subsiste sur
   l'historique Git.

2. **Auth : protection mots de passe compromis.** Supabase > Authentication >
   Policies : activer « Leaked password protection » (vérification HaveIBeenPwned).

3. **Bucket de stockage `documents`.** Il est public et autorise le listing de
   tous les fichiers (politiques « Lecture documents » et « Lecture publique
   des documents »). Si les documents ne sont pas censés être énumérables par
   tous, retirer la politique de listing et ne garder que l'accès par URL.

4. **Redirect URLs.** Dans Supabase Auth, restreindre les URL de redirection
   autorisées (le reset de mot de passe redirige vers `window.location.origin`).

5. **Rate limiting production.** Le limiteur actuel est en mémoire, donc local
   à chaque instance serverless. Pour une vraie protection multi-instances,
   passer à Upstash Ratelimit (`@upstash/ratelimit` + `@upstash/redis`).

6. **RGPD.** Documenter dans la politique de confidentialité que les prompts
   sont transmis à Mistral (sous-traitant). Prévoir une procédure d'export et
   de suppression des données, et une durée de rétention pour le forum et la
   table d'audit.

7. **Confidentialité des profils (à arbitrer).** Tout utilisateur connecté
   peut lire tous les profils (emails inclus). Resserrer à « même structure +
   admin » est possible, mais à tester avec l'affichage des auteurs du forum.

## Vérifications passées

- `npx tsc --noEmit` : aucune erreur de typage.
- Les nouveaux fichiers passent ESLint sans erreur. Restent 16 avertissements
  pré-existants (`react/no-unescaped-entities`) dans le texte statique de
  `PromptAssistant.tsx`, sans rapport avec ces correctifs.
