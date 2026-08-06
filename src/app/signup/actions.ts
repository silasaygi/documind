'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type SignupState = {
  error?: string
  success?: string
}

export async function signup(
  _prev: SignupState | null,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const passwordAgain = String(formData.get('passwordAgain') ?? '')

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunludur.' }
  }

  if (password.length < 8) {
    return { error: 'Şifre en az 8 karakter olmalıdır.' }
  }

  if (password !== passwordAgain) {
    return { error: 'Şifreler eşleşmiyor.' }
  }

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const origin = `${protocol}://${host}`

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  })

  if (error) {
    return { error: 'Kayıt oluşturulamadı. Bu e-posta zaten kullanımda olabilir.' }
  }

  if (data.session) {
    return { success: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.' }
  }

  return {
    success:
      'Hesabınız oluşturuldu. E-postanıza gönderilen doğrulama bağlantısına tıklayın. ' +
      'Mesaj gelmezse spam klasörünü kontrol edin.',
  }
}