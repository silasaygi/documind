import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { embedQuery } from '@/lib/ai/embeddings'
import { SYSTEM_PROMPT, buildContextBlock } from '@/lib/ai/prompts'
import { checkApiKey, getServiceUserId } from '@/lib/api/auth'
import type { MatchDocumentsRow } from '@/types/rpc'

export const runtime = 'nodejs'
export const maxDuration = 60

// Kosinüs benzerliği her zaman -1 ile 1 arasındadır.
const MATCH_THRESHOLD = 0.5
const MATCH_COUNT = 5

export async function POST(request: Request) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const userId = await getServiceUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Servis kullanıcısı bulunamadı' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const question = String(body?.question ?? '').trim()

  if (question.length < 3) {
    return NextResponse.json({ error: 'Soru çok kısa' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()
  const embedding = await embedQuery(question.slice(0, 2000))

  const { data: chunks, error } = await admin.rpc('match_documents_for_user', {
    p_user_id: userId,
    query_embedding: JSON.stringify(embedding),
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  } as never)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (chunks ?? []) as MatchDocumentsRow[]

  if (!rows.length) {
    return NextResponse.json({
      found: false,
      answer: 'Dokümanlarınızda bu konuyla ilgili bilgi bulunamadı.',
      sources: [],
      confidence: 0,
    })
  }

  const sources = Array.from(
    new Map(rows.map((r) => [r.document_title, r.similarity])).entries()
  ).map(([title, similarity]) => ({ title, similarity: Number(similarity.toFixed(3)) }))

  const confidence = Math.max(...rows.map((r) => r.similarity))

  const { text } = await generateText({
    model: google(process.env.GEMINI_CHAT_MODEL ?? 'gemini-flash-lite-latest'),
    system:
      SYSTEM_PROMPT +
      '\n\nBu bir müşteri e-postasına verilecek yanıt taslağıdır. ' +
      'Nazik bir selamlama ile başla, kısa ve net yaz, imza ekleme.',
    prompt: `${buildContextBlock(rows)}\n\nSORU: ${question}`,
    maxRetries: 1,
  })

  return NextResponse.json({
    found: true,
    answer: text.replace(/\s*\[\d+(?:\s*,\s*\d+)*\]/g, '').trim(),
    sources,
    confidence: Number(confidence.toFixed(3)),
  })
}