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

  if (error) return 'E-posta veya şifre hatalı.'

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(_prev: string | null, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır.'

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) return 'Kayıt oluşturulamadı. Bu e-posta zaten kullanımda olabilir.'

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}