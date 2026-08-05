import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-medium">DocuMind AI</span>
          <Link href="/chat" className="text-sm text-neutral-600 hover:text-neutral-900">
              Sohbet
            </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-neutral-600 hover:text-neutral-900">
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}