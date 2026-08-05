import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { embedQuery } from './embeddings'
import type { MatchDocumentsRow } from '@/types/rpc'

export async function searchChunks(
  query: string,
  options: { threshold?: number; count?: number } = {}
): Promise<MatchDocumentsRow[]> {
  const { threshold = 0.35, count = 5 } = options

  const trimmed = query.trim()
  if (trimmed.length < 3) return []

  const embedding = await embedQuery(trimmed.slice(0, 2000))
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: JSON.stringify(embedding),
    match_threshold: threshold,
    match_count: count,
  } as never)

  if (error) {
    console.error('Vektör araması hatası:', error.message)
    return []
  }

  return (data ?? []) as MatchDocumentsRow[]
}