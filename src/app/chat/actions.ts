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