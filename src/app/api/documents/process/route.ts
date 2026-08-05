import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { extractText } from '@/lib/text/extract'
import { chunkText } from '@/lib/text/chunk'
import { embedChunks } from '@/lib/ai/embeddings'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { documentId } = await request.json()
  if (!documentId) {
    return NextResponse.json({ error: 'documentId zorunlu' }, { status: 400 })
  }

  const { data: doc } = await supabase
    .from('documents')
    .select('id, user_id, storage_path, mime_type, file_name')
    .eq('id', documentId)
    .single()

  if (!doc) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })

  try {
    await supabaseAdmin
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', doc.id)

    const { data: file, error: dlError } = await supabaseAdmin.storage
      .from('documents-bucket')
      .download(doc.storage_path)

    if (dlError || !file) throw new Error('Dosya indirilemedi')

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractText(buffer, doc.mime_type, doc.file_name)

    if (!text.trim()) {
      throw new Error('Dosyadan metin çıkarılamadı. Taranmış PDF olabilir.')
    }

    const chunks = chunkText(text)
    if (!chunks.length) throw new Error('Metin parçalanamadı')

    const vectors = await embedChunks(chunks)

    const rows = chunks.map((content, i) => ({
      document_id: doc.id,
      user_id: doc.user_id,
      chunk_index: i,
      content,
      token_count: Math.ceil(content.length / 4),
      embedding: JSON.stringify(vectors[i]),
    }))

    const { error: insertError } = await supabaseAdmin
      .from('document_chunks')
      .insert(rows)

    if (insertError) throw new Error(insertError.message)

    await supabaseAdmin
      .from('documents')
      .update({ status: 'ready', chunk_count: chunks.length, error_message: null })
      .eq('id', doc.id)

    return NextResponse.json({ ok: true, chunks: chunks.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    await supabaseAdmin
      .from('documents')
      .update({ status: 'failed', error_message: message })
      .eq('id', doc.id)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}