// src/lib/supabaseServer.ts
// Client Supabase côté serveur, utilisé pour vérifier le jeton d'un appelant.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Valide un access_token Supabase reçu dans l'en-tête Authorization.
 * Retourne l'utilisateur si le jeton est valide, sinon null.
 */
export async function getUserFromToken(authHeader: string | null) {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;
  return data.user;
}
