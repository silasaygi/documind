import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChatClient } from './chat-client'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ready')

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="font-medium">DocuMind AI</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-neutral-600 hover:text-neutral-900">
              Dokümanlarım
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-neutral-600 hover:text-neutral-900">Çıkış</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        {!count ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <p className="text-sm text-neutral-600">
              Henüz hazır dokümanınız yok.
            </p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block text-sm text-neutral-900 underline"
            >
              Doküman yükle
            </Link>
          </div>
        ) : (
          <ChatClient />
        )}
      </main>
    </div>
  )
}