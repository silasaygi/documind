'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signup, type SignupState } from './actions'

export default function SignupPage() {
  const [state, action, pending] = useActionState<SignupState | null, FormData>(
    signup,
    null
  )

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8">
        <h1 className="text-xl font-medium">Hesap oluştur</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dokümanlarınızı yükleyip sorgulamaya başlayın.
        </p>

        {state?.success ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-md bg-green-50 px-3 py-3 text-sm text-green-800">
              {state.success}
            </p>
            <Link
              href="/login"
              className="block rounded-md bg-neutral-900 px-4 py-2 text-center text-sm text-white"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form action={action} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-neutral-700">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-neutral-700">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
              <p className="mt-1 text-xs text-neutral-400">En az 8 karakter</p>
            </div>

            <div>
              <label htmlFor="passwordAgain" className="block text-sm text-neutral-700">
                Şifre (tekrar)
              </label>
              <input
                id="passwordAgain"
                name="passwordAgain"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            {state?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {pending ? 'Oluşturuluyor...' : 'Hesap oluştur'}
            </button>

            <p className="text-center text-sm text-neutral-500">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-neutral-900 underline">
                Giriş yapın
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}