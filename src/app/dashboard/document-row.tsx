'use client'

import { useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDocument } from './actions'

type Doc = {
  id: string
  title: string
  status: string
  chunk_count: number
  error_message: string | null
  created_at: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor',
  processing: 'İşleniyor',
  ready: 'Hazır',
  failed: 'Başarısız',
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
  processing: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  ready: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  failed: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

export function DocumentRow({ doc }: { doc: Doc }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (doc.status !== 'pending' && doc.status !== 'processing') return
    const timer = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(timer)
  }, [doc.status, router])

  return (
    <li className="px-5 py-4 transition hover:bg-stone-50">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{doc.title}</p>
          <p className="text-xs text-slate-500">
            {doc.chunk_count} parça ·{' '}
            {new Date(doc.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUS_STYLE[doc.status] ?? 'bg-stone-100 text-stone-600'
            }`}
          >
            {STATUS_LABEL[doc.status] ?? doc.status}
          </span>
          <button
            onClick={() => {
              if (!confirm(`"${doc.title}" silinecek. Emin misiniz?`)) return
              startTransition(() => deleteDocument(doc.id))
            }}
            disabled={pending}
            className="text-xs text-slate-500 transition hover:text-rose-600 disabled:opacity-50"
          >
            Sil
          </button>
        </div>
      </div>

      {doc.status === 'failed' && doc.error_message && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-100">
          {doc.error_message}
        </p>
      )}
    </li>
  )
}