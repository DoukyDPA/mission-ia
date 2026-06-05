// src/lib/rateLimit.ts
// Limiteur de débit simple, en mémoire (fenêtre glissante).
//
// ATTENTION : la mémoire n'est pas partagée entre les instances serverless.
// En production sérieuse, remplace ce module par Upstash Ratelimit
// (@upstash/ratelimit + @upstash/redis), qui partage l'état entre instances.
// Ici, ça suffit déjà à bloquer un abus basique depuis un seul utilisateur.

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key       identifiant unique (id utilisateur ou IP)
 * @param limit     nombre de requêtes autorisées dans la fenêtre
 * @param windowMs  durée de la fenêtre en millisecondes
 */
export function rateLimit(key: string, limit = 10, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

// Nettoyage périodique pour éviter que la Map grossisse sans fin.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, hit] of buckets) {
      if (now > hit.resetAt) buckets.delete(key);
    }
  }, 5 * 60_000).unref?.();
}
