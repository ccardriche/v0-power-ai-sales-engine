import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client using the service role key.
 * This client bypasses RLS and should only be used by server-side agents.
 */
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
