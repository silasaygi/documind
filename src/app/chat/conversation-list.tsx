import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function ConversationList({ activeId }: { activeId?: string }) {
  const supabase = await createClient()
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })
    .limit(20)

  if (!conversations?.length) return null

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Link
        href="/chat"
        className="rounded-lg border border-dashed border-stone-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-amber-400 hover:text-amber-700"
      >
        + Yeni sohbet
      </Link>
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/chat/${c.id}`}
          className={`max-w-[200px] truncate rounded-lg px-3 py-1.5 text-xs transition ${
            c.id === activeId
              ? 'bg-slate-900 text-white'
              : 'border border-stone-200 bg-white text-slate-600 hover:border-stone-300 hover:text-slate-900'
          }`}
        >
          {c.title}
        </Link>
      ))}
    </div>
  )
}