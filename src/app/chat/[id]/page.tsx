import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChatClient } from '../chat-client'
import { ConversationList } from '../conversation-list'
import { deleteConversation } from '../actions'
import type { UIMessage } from 'ai'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, title')
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const { data: rows } = await supabase
    .from('messages')
    .select('id, role, parts')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const initialMessages = (rows ?? []).map((r) => ({
    id: r.id,
    role: r.role,
    parts: r.parts,
  })) as UIMessage[]

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
              className="font-medium text-slate-600 transition hover:text-amber-700"
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
        <ConversationList activeId={id} />

        <form action={deleteConversation.bind(null, id)} className="mb-3">
          <button className="text-xs text-slate-500 transition hover:text-rose-600">
            Bu sohbeti sil
          </button>
        </form>

        <ChatClient conversationId={id} initialMessages={initialMessages} />
      </main>
    </div>
  )
}