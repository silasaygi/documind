import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader({
  width = 'max-w-5xl',
}: {
  width?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-stone-200 bg-white">
      <div
        className={`mx-auto flex ${width} items-center justify-between gap-4 px-6 py-4`}
      >
        <Link
          href="/dashboard"
          className="font-semibold tracking-tight text-slate-900"
        >
          DocuMind AI
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link
            href="/dashboard"
            className="font-medium text-slate-600 transition hover:text-amber-700"
          >
            Dokümanlarım
          </Link>

          <Link
            href="/inbox"
            className="font-medium text-slate-600 transition hover:text-amber-700"
          >
            Gelen Kutusu
          </Link>

          <Link
            href="/chat"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
          >
            Sohbet
          </Link>

          <span className="hidden text-slate-400 sm:inline">{user?.email}</span>

          <form action="/auth/signout" method="post">
            <button className="text-slate-600 transition hover:text-slate-900">
              Çıkış
            </button>
          </form>
        </nav>
      </div>
    </header>
  )
}