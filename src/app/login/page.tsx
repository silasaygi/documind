'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null)

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-stone-50 to-stone-100 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          DocuMind AI
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Dokümanlarınızı yükleyin, sorularınızı sorun.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {pending ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Hesabınız yok mu?{' '}
            <Link
              href="/signup"
              className="font-medium text-amber-700 underline-offset-2 hover:underline"
            >
              Kayıt olun
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}