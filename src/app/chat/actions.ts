'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function deleteConversation(conversationId: string) {
  const supabase = await createClient()
  await supabase.from('conversations').delete().eq('id', conversationId)
  revalidatePath('/chat')
  redirect('/chat')
}

export type ActionKind = 'task' | 'share' | 'note'

export type CreateActionState = { error?: string; success?: string }

export async function createAction(
  _prev: CreateActionState | null,
  formData: FormData
): Promise<CreateActionState> {
  const kind = String(formData.get('kind') ?? '') as ActionKind
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const conversationId = String(formData.get('conversationId') ?? '') || null

  if (!['task', 'share', 'note'].includes(kind)) {
    return { error: 'Geçersiz aksiyon türü.' }
  }
  if (title.length < 3) {
    return { error: 'Başlık en az 3 karakter olmalıdır.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum bulunamadı.' }

  const { data: action, error } = await supabase
    .from('actions')
    .insert({
      user_id: user.id,
      kind,
      title,
      payload: { content },
      source_conversation_id: conversationId,
      status: 'queued',
    })
    .select('id')
    .single()

  if (error) return { error: 'Kaydedilemedi: ' + error.message }

  const webhookUrl = process.env.N8N_ACTION_WEBHOOK_URL

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DOCUMIND_API_KEY ?? '',
        },
        body: JSON.stringify({
          actionId: action.id,
          kind,
          title,
          content,
          userEmail: user.email,
        }),
      })

      await supabase
        .from('actions')
        .update({ status: res.ok ? 'sent' : 'failed' })
        .eq('id', action.id)

      if (!res.ok) return { error: `n8n akışı hata döndü (${res.status}).` }
    } catch {
      await supabase.from('actions').update({ status: 'failed' }).eq('id', action.id)
      return { error: 'n8n akışına ulaşılamadı.' }
    }
  }

  revalidatePath('/chat')
  return { success: 'Aksiyon oluşturuldu.' }
}