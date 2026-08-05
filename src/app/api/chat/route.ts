import { streamText, convertToModelMessages, stepCountIs, tool, type UIMessage } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { searchChunks } from '@/lib/ai/search'
import { SYSTEM_PROMPT, buildContextBlock } from '@/lib/ai/prompts'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Yetkisiz', { status: 401 })

  const body = await request.json()
  const raw = body?.messages ?? []
  const messages: UIMessage[] = Array.isArray(raw) ? raw : [raw]

  if (!messages.length) {
    return new Response('Mesaj bulunamadı', { status: 400 })
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

  return result.toUIMessageStreamResponse()
}