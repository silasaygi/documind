import 'server-only'

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    const pdfParse = (await import('pdf-parse')).default
    const result = await pdfParse(buffer)
    return result.text
  }

  return buffer.toString('utf-8')
}