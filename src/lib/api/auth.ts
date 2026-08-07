import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export function checkApiKey(request: Request): boolean {
  const key = request.headers.get('x-api-key')
  const expected = process.env.DOCUMIND_API_KEY
  if (!expected || !key) return false
  if (key.length !== expected.length) return false

  let diff = 0
  for (let i = 0; i < key.length; i++) {
    diff |= key.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

let cachedUserId: string | null = null

export async function getServiceUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId

  const email = process.env.SERVICE_USER_EMAIL
  if (!email) return null

  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  cachedUserId = data?.id ?? null
  return cachedUserId
}