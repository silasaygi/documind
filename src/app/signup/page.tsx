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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Hesap oluştur
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Dokümanlarınızı yükleyip sorgulamaya başlayın.
        </p>

        {state?.success ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
              {state.success}
            </p>
            <Link
              href="/login"
              className="block rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form action={action} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
              />
              <p className="mt-1 text-xs text-slate-400">En az 8 karakter</p>
            </div>

            <div>
              <label
                htmlFor="passwordAgain"
                className="block text-sm font-medium text-slate-700"
              >
                Şifre (tekrar)
              </label>
              <input
                id="passwordAgain"
                name="passwordAgain"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {pending ? 'Oluşturuluyor...' : 'Hesap oluştur'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Zaten hesabınız var mı?{' '}
              <Link
                href="/login"
                className="font-medium text-amber-700 underline-offset-2 hover:underline"
              >
                Giriş yapın
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}