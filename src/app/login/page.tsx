'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null)

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8">
        <h1 className="text-xl font-medium">DocuMind AI</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dokümanlarınızı yükleyin, sorularınızı sorun.
        </p>

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
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {pending ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>

          <p className="text-center text-sm text-neutral-500">
            Hesabınız yok mu?{' '}
            <Link href="/signup" className="text-neutral-900 underline">
              Kayıt olun
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}