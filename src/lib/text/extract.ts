import 'server-only'

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    const mod: Record<string, unknown> = await import('pdf-parse')
    const candidate = mod.pdf ?? mod.default ?? mod
    const parse = candidate as (b: Buffer) => Promise<{ text: string }>
    const result = await parse(buffer)
    return result.text
  }

  return buffer.toString('utf-8')
}