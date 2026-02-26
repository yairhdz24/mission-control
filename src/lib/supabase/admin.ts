import { createClient } from '@supabase/supabase-js'

// Admin client with service role key - use only in API routes
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key || url === 'your_supabase_url') {
    throw new Error('Supabase environment variables are not configured')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
