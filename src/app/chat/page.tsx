import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChatClient } from './chat-client'
import { ConversationList } from './conversation-list'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ready')

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="font-semibold tracking-tight text-slate-900">
            DocuMind AI
          </span>
          <div className="flex items-center gap-4 text-sm">
          <Link
              href="/dashboard"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Dokümanlarım
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-slate-600 transition hover:text-slate-900">
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-6">
        {!count ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-600">Henüz hazır dokümanınız yok.</p>
            <Link
              href="/dashboard"
              className="mt-3 inline-block text-sm font-medium text-amber-700 underline-offset-2 hover:underline"
            >
              Doküman yükle
            </Link>
          </div>
        ) : (
          <>
            <ConversationList />
            <ChatClient />
          </>
        )}
      </main>
    </div>
  )
}