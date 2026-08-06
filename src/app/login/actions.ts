'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(_prev: string | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return 'E-posta ve şifre zorunludur.'

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('not confirmed')) {
      return 'E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.'
    }
    return 'E-posta veya şifre hatalı.'
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}