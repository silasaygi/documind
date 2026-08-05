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
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100"
      >
        + Yeni sohbet
      </Link>
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`/chat/${c.id}`}
          className={`max-w-[200px] truncate rounded-md px-3 py-1.5 text-xs ${
            c.id === activeId
              ? 'bg-neutral-900 text-white'
              : 'border border-neutral-200 bg-white hover:bg-neutral-100'
          }`}
        >
          {c.title}
        </Link>
      ))}
    </div>
  )
}