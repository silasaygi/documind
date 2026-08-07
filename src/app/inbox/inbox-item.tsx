'use client'

import { useActionState, useState, useTransition } from 'react'
import { approveAndSend, dismissItem, type ApproveState } from './actions'

export type Item = {
  id: string
  source: string
  sender: string | null
  subject: string | null
  question: string
  draft_answer: string | null
  final_answer: string | null
  sources: unknown
  confidence: number | null
  status: string
  created_at: string
}

type Source = { title: string; similarity: number }

function confidenceStyle(c: number | null) {
  if (c === null) return 'bg-stone-100 text-stone-600 ring-stone-200'
  if (c >= 0.7) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (c >= 0.5) return 'bg-amber-50 text-amber-800 ring-amber-200'
  return 'bg-rose-50 text-rose-700 ring-rose-200'
}

function confidenceLabel(c: number | null) {
  if (c === null) return 'bilinmiyor'
  if (c >= 0.7) return 'yüksek güven'
  if (c >= 0.5) return 'orta güven'
  return 'düşük güven'
}

export function InboxItem({
  item,
  readOnly,
  isOpen,
  onToggle,
}: {
  item: Item
  readOnly: boolean
  isOpen: boolean
  onToggle: () => void
}) {
  const [state, action, pending] = useActionState<ApproveState | null, FormData>(
    approveAndSend,
    null
  )
  const [draft, setDraft] = useState(item.final_answer ?? item.draft_answer ?? '')
  const [dismissing, startDismiss] = useTransition()

  const sources = Array.isArray(item.sources) ? (item.sources as Source[]) : []

  return (
    <li className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-stone-50"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {item.subject ?? 'Konu yok'}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {item.sender ?? 'bilinmeyen'} ·{' '}
            {new Date(item.created_at).toLocaleString('tr-TR')}
          </p>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
            {item.question}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${confidenceStyle(
              item.confidence
            )}`}
          >
            {confidenceLabel(item.confidence)}
          </span>
          {item.status === 'sent' && (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600 ring-1 ring-stone-200">
              gönderildi
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-stone-200 px-5 py-4">
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500">Gelen soru</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {item.question}
            </p>
          </div>

          {sources.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500">
                Kullanılan kaynaklar
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {sources.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-600"
                  >
                    {s.title} · %{Math.round(s.similarity * 100)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {readOnly ? (
            <div>
              <p className="text-xs font-medium text-slate-500">Gönderilen yanıt</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {item.final_answer ?? item.draft_answer}
              </p>
            </div>
          ) : (
            <form action={action}>
              <input type="hidden" name="id" value={item.id} />

              <label
                htmlFor={`answer-${item.id}`}
                className="text-xs font-medium text-slate-500"
              >
                Taslak yanıt (düzenleyebilirsiniz)
              </label>
              <textarea
                id={`answer-${item.id}`}
                name="finalAnswer"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={8}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm leading-relaxed outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
              />

              {state?.error && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
                  {state.error}
                </p>
              )}

              {state?.success && (
                <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-100">
                  {state.success}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={pending || dismissing}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {pending ? 'Gönderiliyor...' : 'Onayla ve gönder'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Bu kayıt kuyruktan kaldırılsın mı?')) return
                    startDismiss(() => dismissItem(item.id))
                  }}
                  disabled={pending || dismissing}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-stone-50 disabled:opacity-50"
                >
                  Yoksay
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </li>
  )
}