'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ALLOWED = ['application/pdf', 'text/plain', 'text/markdown']
const MAX_SIZE = 20 * 1024 * 1024

export async function uploadDocument(_prev: string | null, formData: FormData) {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return 'Dosya seçilmedi.'
  if (file.size > MAX_SIZE) return 'Dosya 20 MB sınırını aşıyor.'

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const okType = ALLOWED.includes(file.type) || ['pdf', 'txt', 'md'].includes(ext)
  if (!okType) return 'Yalnızca PDF, TXT ve Markdown dosyaları desteklenir.'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'Oturum bulunamadı.'

  const documentId = crypto.randomUUID()
  const storagePath = `${user.id}/${documentId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documents-bucket')
    .upload(storagePath, file, { contentType: file.type || 'application/octet-stream' })

  if (uploadError) return 'Dosya yüklenemedi: ' + uploadError.message

  const { error: insertError } = await supabase.from('documents').insert({
    id: documentId,
    user_id: user.id,
    title: file.name.replace(/\.[^.]+$/, ''),
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type || 'application/octet-stream',
    size_bytes: file.size,
    status: 'pending',
  })

  if (insertError) {
    await supabase.storage.from('documents-bucket').remove([storagePath])
    return 'Kayıt oluşturulamadı: ' + insertError.message
  }

  revalidatePath('/dashboard')
  return `ok:${documentId}`
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', documentId)
    .single()

  if (doc) {
    await supabase.storage.from('documents-bucket').remove([doc.storage_path])
    await supabase.from('documents').delete().eq('id', documentId)
  }

  revalidatePath('/dashboard')
}