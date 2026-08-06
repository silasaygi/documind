import { createClient } from '@/lib/supabase/server'
import { UploadForm } from './upload-form'
import { DocumentRow } from './document-row'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, status, chunk_count, error_message, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          Dokümanlarım
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          PDF, TXT veya Markdown yükleyin. Metin parçalara ayrılıp aranabilir hale
          getirilir.
        </p>
      </div>

      <UploadForm />

      {!documents?.length ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-600">Henüz doküman yüklemediniz.</p>
        </div>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </ul>
      )}
    </div>
  )
}