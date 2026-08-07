import { createClient } from '@/lib/supabase/server'
import { InboxList } from './inbox-list'

export default async function InboxPage() {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('inbox_items')
    .select('*')
    .order('status', { ascending: true })
    .order('confidence', { ascending: true })
    .order('created_at', { ascending: false })

  const pending = items?.filter((i) => i.status === 'pending') ?? []
  const others = items?.filter((i) => i.status !== 'pending') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          Gelen Kutusu
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Dışarıdan gelen sorular ve dokümanlarınıza dayanarak üretilen taslak
          yanıtlar. Hiçbir yanıt siz onaylamadan gönderilmez.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Bekleyen</p>
          <p className="text-lg font-medium text-slate-900">{pending.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Düşük güvenli</p>
          <p className="text-lg font-medium text-slate-900">
            {pending.filter((i) => (i.confidence ?? 0) < 0.5).length}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Yanıtlanan</p>
          <p className="text-lg font-medium text-slate-900">
            {others.filter((i) => i.status === 'sent').length}
          </p>
        </div>
      </div>

      {!pending.length ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-600">Bekleyen soru yok.</p>
        </div>
      ) : (
        <InboxList items={pending} />
      )}

      {others.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-700">Geçmiş</h2>
          <InboxList items={others} readOnly />
        </div>
      )}
    </div>
  )
}