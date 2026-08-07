import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkApiKey, getServiceUserId } from '@/lib/api/auth'

export const runtime = 'nodejs'

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

  if (!question) {
    return NextResponse.json({ error: 'question zorunlu' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  const { data, error } = await admin
    .from('inbox_items')
    .insert({
      user_id: userId,
      source: body?.source ?? 'email',
      external_id: body?.externalId ?? null,
      sender: body?.sender ?? null,
      subject: body?.subject ?? null,
      question,
      draft_answer: body?.draftAnswer ?? null,
      sources: body?.sources ?? [],
      confidence: body?.confidence ?? null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}