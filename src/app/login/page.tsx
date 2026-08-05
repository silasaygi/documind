'use client'

import { useActionState } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [loginError, loginAction, loginPending] = useActionState(login, null)
  const [signupError, signupAction, signupPending] = useActionState(signup, null)
  const error = loginError ?? signupError
  const pending = loginPending || signupPending

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8">
        <h1 className="text-xl font-medium">DocuMind AI</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dokümanlarınızı yükleyin, sorularınızı sorun.
        </p>

        <form className="mt-6 space-y-4">
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
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              formAction={loginAction}
              disabled={pending}
              className="flex-1 rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {pending ? 'Bekleyin...' : 'Giriş yap'}
            </button>
            <button
              formAction={signupAction}
              disabled={pending}
              className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Kayıt ol
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}