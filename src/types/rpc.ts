export type MatchDocumentsArgs = {
    query_embedding: number[]
    match_threshold?: number
    match_count?: number
    filter_document_id?: string | null
  }
  
  export type MatchDocumentsRow = {
    id: number
    document_id: string
    document_title: string
    chunk_index: number
    content: string
    similarity: number
  }