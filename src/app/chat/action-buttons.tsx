'use client'

import { useActionState, useState } from 'react'
import { createAction, type CreateActionState } from './actions'

const KINDS = [
  { key: 'task', label: 'Görev oluştur' },
  { key: 'share', label: 'Ekibe gönder' },
  { key: 'note', label: 'Not olarak kaydet' },
] as const

export function ActionButtons({
  content,
  conversationId,
}: {
  content: string
  conversationId?: string
}) {
  const [open, setOpen] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [state, action, pending] = useActionState<CreateActionState | null, FormData>(
    createAction,
    null
  )

  if (state?.success) {
    return (
      <p className="mt-3 text-xs text-emerald-700">
        {state.success}
      </p>
    )
  }

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      {!open ? (
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.key}
              onClick={() => {
                setOpen(k.key)
                setTitle('')
              }}
              className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-amber-400 hover:text-amber-700"
            >
              {k.label}
            </button>
          ))}
        </div>
      ) : (
        <form action={action} className="space-y-2">
          <input type="hidden" name="kind" value={open} />
          <input type="hidden" name="content" value={content} />
          {conversationId && (
            <input type="hidden" name="conversationId" value={conversationId} />
          )}

          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kısa bir başlık yazın..."
            autoFocus
            className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs outline-none focus:border-slate-800"
          />

          {state?.error && (
            <p className="text-xs text-rose-600">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending || title.trim().length < 3}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              {pending ? 'Gönderiliyor...' : 'Oluştur'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-slate-600"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </div>
  )
}