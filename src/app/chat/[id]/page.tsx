import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
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
      <SiteHeader width="max-w-3xl" />

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