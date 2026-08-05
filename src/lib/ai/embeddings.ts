import 'server-only'
import { google } from '@ai-sdk/google'
import { embed } from 'ai'

const model = google.textEmbeddingModel('gemini-embedding-001')
const DIMENSIONS = 768

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const vectors: number[][] = []

  for (const chunk of chunks) {
    const { embedding } = await embed({
      model,
      value: chunk,
      providerOptions: {
        google: {
          outputDimensionality: DIMENSIONS,
          taskType: 'RETRIEVAL_DOCUMENT',
        },
      },
    })
    vectors.push(embedding)
    await new Promise((r) => setTimeout(r, 300))
  }

  return vectors
}

export async function embedQuery(query: string): Promise<number[]> {
  const { embedding } = await embed({
    model,
    value: query,
    providerOptions: {
      google: {
        outputDimensionality: DIMENSIONS,
        taskType: 'RETRIEVAL_QUERY',
      },
    },
  })
  return embedding
}