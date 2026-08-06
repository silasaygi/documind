'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadDocument } from './actions'

export function UploadForm() {
  const [result, action, pending] = useActionState(uploadDocument, null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!result) return

    if (!result.startsWith('ok:')) {
      setError(result)
      return
    }

    const documentId = result.slice(3)
    setError(null)
    setProcessing(true)
    formRef.current?.reset()

    fetch('/api/documents/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? 'İşleme sırasında hata oluştu.')
        }
      })
      .catch(() => setError('İşleme isteği gönderilemedi.'))
      .finally(() => {
        setProcessing(false)
        router.refresh()
      })
  }, [result, router])

  const busy = pending || processing

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <form ref={formRef} action={action} className="flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".pdf,.txt,.md"
          required
          disabled={busy}
          className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-slate-800"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          {pending ? 'Yükleniyor...' : processing ? 'İşleniyor...' : 'Yükle'}
        </button>
      </form>

      {busy && (
        <p className="mt-3 text-sm text-slate-500">
          {pending
            ? 'Dosya yükleniyor...'
            : 'Metin çıkarılıyor ve vektörler üretiliyor. Bu işlem dosya boyutuna göre 10-60 saniye sürebilir.'}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}
    </div>
  )
}