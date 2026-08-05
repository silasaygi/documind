const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 150

export function chunkText(raw: string): string[] {
  const text = raw.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!text) return []

  const paragraphs = text.split(/\n\n+/)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    if (paragraph.length > CHUNK_SIZE) {
      if (current) {
        chunks.push(current.trim())
        current = ''
      }
      const sentences = paragraph.split(/(?<=[.!?])\s+/)
      for (const sentence of sentences) {
        if ((current + ' ' + sentence).length > CHUNK_SIZE) {
          if (current) chunks.push(current.trim())
          current = sentence
        } else {
          current = current ? current + ' ' + sentence : sentence
        }
      }
      continue
    }

    if ((current + '\n\n' + paragraph).length > CHUNK_SIZE) {
      chunks.push(current.trim())
      current = paragraph
    } else {
      current = current ? current + '\n\n' + paragraph : paragraph
    }
  }

  if (current.trim()) chunks.push(current.trim())

  return chunks.map((chunk, i) => {
    if (i === 0) return chunk
    const previous = chunks[i - 1]
    const tail = previous.slice(-CHUNK_OVERLAP)
    return tail + '\n' + chunk
  })
}