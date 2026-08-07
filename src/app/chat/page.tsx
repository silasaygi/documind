import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
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
      <SiteHeader width="max-w-3xl" />

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