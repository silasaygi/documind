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