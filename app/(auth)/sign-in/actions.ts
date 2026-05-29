'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * Auto-confirms user email after signup since email verification is disabled in Supabase.
 * This uses the service role key which has admin privileges.
 */
export async function confirmUserEmail(userId: string) {
  try {
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Confirm the user's email
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (error) {
      console.error('[v0] Error confirming email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('[v0] Error in confirmUserEmail:', err)
    return { success: false, error: 'Failed to confirm email' }
  }
}
