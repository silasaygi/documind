import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChatClient } from '../chat-client'
import { ConversationList } from '../conversation-list'
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
        <ConversationList activeId={id} />
        <ChatClient conversationId={id} initialMessages={initialMessages} />
      </main>
    </div>
  )
}