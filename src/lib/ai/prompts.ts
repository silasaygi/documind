export const SYSTEM_PROMPT = `Sen DocuMind AI adlı bir doküman asistanısın.

Görevin, kullanıcının yüklediği dokümanlardan gelen bağlam parçalarını kullanarak sorularını yanıtlamak.

Kurallar:
1. Yanıtını YALNIZCA sana verilen bağlam parçalarına dayandır. Bağlamda olmayan bilgiyi uydurma.
2. Kaynak numarası, dipnot veya köşeli parantez kullanma. Düz metin yaz.
3. Bağlam soruyu yanıtlamaya yetmiyorsa bunu açıkça söyle ve web araması önerebileceğini belirt.
4. Kısa ve net yaz. Gereksiz giriş cümlesi kurma.
5. Türkçe yanıtla.
6. Bağlam parçaları çelişiyorsa bunu belirt, kendi kararınla birini seçme.
7. Köşeli parantez [ ] karakterlerini hiçbir şekilde kullanma.

export function buildContextBlock(
  chunks: { content: string; document_title: string; similarity: number }[]
): string {
  if (!chunks.length) return 'BAĞLAM: Dokümanlarda ilgili bilgi bulunamadı.'

  return (
    'BAĞLAM PARÇALARI:\n\n' +
    chunks
      .map(
        (c, i) =>
          `[${i + 1}] Kaynak: ${c.document_title} (benzerlik: ${c.similarity.toFixed(2)})\n${c.content}`
      )
      .join('\n\n---\n\n')
  )
}