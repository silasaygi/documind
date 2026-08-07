import { streamText, convertToModelMessages, stepCountIs, tool, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { searchChunks } from '@/lib/ai/search'
import { SYSTEM_PROMPT, buildContextBlock } from '@/lib/ai/prompts'
import type { Json } from '@/types/database.types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Yetkisiz', { status: 401 })

  const supabaseAdmin = getSupabaseAdmin()
  const body = await request.json()
  const raw = body?.messages ?? []
  const messages: UIMessage[] = Array.isArray(raw) ? raw : [raw]

  if (!messages.length) {
    return new Response('Mesaj bulunamadı', { status: 400 })
  }

  let conversationId: string | null = body?.conversationId ?? null

  if (!conversationId) {
    const firstText = messages
      .find((m) => m.role === 'user')
      ?.parts?.find((p) => p.type === 'text')

    const title =
      firstText && 'text' in firstText
        ? String(firstText.text).slice(0, 60)
        : 'Yeni sohbet'

    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select('id')
      .single()

    conversationId = conv?.id ?? null
  }
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')

  if (conversationId && lastUserMessage) {
    await supabaseAdmin.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      parts: lastUserMessage.parts as unknown as Json,
    })
  }
  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: google(process.env.GEMINI_CHAT_MODEL ?? 'gemini-flash-lite-latest'),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    stopWhen: stepCountIs(2),
    maxRetries: 1,
    tools: {
      searchDocuments: tool({
        description:
          'Kullanıcının yüklediği dokümanlarda anlamsal arama yapar. ' +
          'Her soruda önce bu aracı kullan.',
        inputSchema: z.object({
          query: z.string().describe('Aranacak konu veya soru'),
        }),
        execute: async ({ query }) => {
          const chunks = await searchChunks(query)
          if (!chunks.length) {
            return {
              found: false,
              message:
                'Dokümanlarda bu konuyla ilgili bilgi bulunamadı. ' +
                'Kullanıcıya web araması yapmak isteyip istemediğini sor.',
            }
          }
          return {
            found: true,
            chunkCount: chunks.length,
            context: buildContextBlock(chunks),
            sources: chunks.map((c, i) => ({
              index: i + 1,
              title: c.document_title,
              similarity: Number(c.similarity.toFixed(3)),
            })),
          }
        },
      }),

      searchWeb: tool({
        description:
          'İnternette arama yapar. YALNIZCA kullanıcı açıkça web araması ' +
          'istediğinde kullan. Kendi kararınla çağırma.',
        inputSchema: z.object({
          query: z.string().describe('Arama sorgusu'),
        }),
        execute: async ({ query }) => {
          return {
            note: 'Web arama entegrasyonu henüz aktif değil.',
            query,
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse({
    headers: conversationId ? { 'x-conversation-id': conversationId } : undefined,
    onFinish: async ({ messages: finalMessages }) => {
      if (!conversationId) return

      const rows = finalMessages
        .filter((m) => m.role === 'assistant')
        .map((m) => ({
          conversation_id: conversationId,
          user_id: user.id,
          role: m.role as string,
          parts: m.parts as unknown as Json,
        }))

      await supabaseAdmin.from('messages').insert(rows)
      await supabaseAdmin
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)
    },
  })
}