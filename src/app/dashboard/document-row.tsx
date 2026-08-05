'use client'

import { useTransition } from 'react'
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
  pending: 'bg-neutral-100 text-neutral-600',
  processing: 'bg-blue-50 text-blue-700',
  ready: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
}

export function DocumentRow({ doc }: { doc: Doc }) {
  const [pending, startTransition] = useTransition()

  return (
    <li className="px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{doc.title}</p>
          <p className="text-xs text-neutral-500">
            {doc.chunk_count} parça ·{' '}
            {new Date(doc.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${
              STATUS_STYLE[doc.status] ?? 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {STATUS_LABEL[doc.status] ?? doc.status}
          </span>
          <button
            onClick={() => startTransition(() => deleteDocument(doc.id))}
            disabled={pending}
            className="text-xs text-neutral-500 hover:text-red-600 disabled:opacity-50"
          >
            Sil
          </button>
        </div>
      </div>

      {doc.status === 'failed' && doc.error_message && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {doc.error_message}
        </p>
      )}
    </li>
  )
}