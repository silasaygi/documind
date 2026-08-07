'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ApproveState = { error?: string; success?: string }

export async function approveAndSend(
  _prev: ApproveState | null,
  formData: FormData
): Promise<ApproveState> {
  const id = String(formData.get('id') ?? '')
  const finalAnswer = String(formData.get('finalAnswer') ?? '').trim()

  if (!id) return { error: 'Kayıt bulunamadı.' }
  if (finalAnswer.length < 10) return { error: 'Yanıt çok kısa.' }

  const supabase = await createClient()

  const { data: item, error: readError } = await supabase
    .from('inbox_items')
    .select('id, source, external_id, sender, subject, question, draft_answer')
    .eq('id', id)
    .single()

  if (readError || !item) return { error: 'Kayıt okunamadı.' }

  const webhookUrl = process.env.N8N_APPROVE_WEBHOOK_URL

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.DOCUMIND_API_KEY ?? '',
        },
        body: JSON.stringify({
          itemId: item.id,
          source: item.source,
          externalId: item.external_id,
          recipient: item.sender,
          subject: item.subject,
          question: item.question,
          answer: finalAnswer,
          edited: finalAnswer !== (item.draft_answer ?? ''),
        }),
      })

      if (!res.ok) {
        return { error: `Gönderim başarısız (${res.status}). Yanıt kaydedilmedi.` }
      }
    } catch {
      return { error: 'n8n akışına ulaşılamadı. Yanıt kaydedilmedi.' }
    }
  }

  const { error } = await supabase
    .from('inbox_items')
    .update({
      final_answer: finalAnswer,
      status: 'sent',
      answered_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: 'Kaydedilemedi: ' + error.message }

  revalidatePath('/inbox')
  return { success: 'Yanıt gönderildi.' }
}

export async function dismissItem(id: string) {
  const supabase = await createClient()
  await supabase.from('inbox_items').update({ status: 'dismissed' }).eq('id', id)
  revalidatePath('/inbox')
}