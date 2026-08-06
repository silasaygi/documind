# DocuMind AI

Dokümanlarınızı yükleyip doğal dille sorgulayabileceğiniz RAG tabanlı bir asistan.
Cevaplar yalnızca yüklenen dokümanlara dayanır; bilgi bulunamazsa model bunu açıkça söyler.

**Canlı demo:** (https://documind-seven-delta.vercel.app/)

Demo hesabı:
- E-posta: `deneme@gmail.com`
- Şifre: `deneme123`

## Nasıl çalışır

1. PDF, TXT veya Markdown yüklenir, Supabase Storage'a kaydedilir
2. Metin çıkarılır ve paragraf sınırlarına göre parçalanır (1000 karakter, 150 karakter örtüşme)
3. Her parça Gemini ile 768 boyutlu vektöre çevrilip pgvector'e yazılır
4. Soru sorulduğunda soru da vektöre çevrilir, kosinüs benzerliğiyle en yakın parçalar bulunur
5. Bulunan bağlam dil modeline verilir, cevap üretilir
6. Bağlam yetersizse model bunu belirtir ve web araması önerir

## Teknoloji

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL + pgvector, Auth, Storage, RLS) · Vercel AI SDK · Google Gemini · Vercel

## Mimari kararlar

**Satır düzeyinde güvenlik.** Veri izolasyonu uygulama kodunda değil, veritabanı
politikalarında tanımlı. Sorgularda `where user_id = ...` yazmaya gerek yok;
kod hata yapsa bile kullanıcılar birbirinin verisini göremez.

**Vektör araması RPC üzerinden.** `match_documents` fonksiyonu kullanıcı kimliğini
parametre olarak almaz, içeride `auth.uid()` çözer. Böylece istemci başkasının
dokümanlarında arama yapamaz.

**Araç çağıran ajan.** Bağlam doğrudan prompta gömülmez; model `searchDocuments`
aracını kendi kararıyla çağırır, sonucu değerlendirir ve yetersizse bunu belirtir.

**Ayrı Supabase istemcileri.** Tarayıcı, sunucu ve yönetici istemcileri ayrı
dosyalarda. `service_role` anahtarı `server-only` ile korunur; yanlışlıkla
istemci tarafına sızarsa build hata verir.

**Ayrı dev/prod veritabanları.** Migration hatalarının canlı veriye zarar
vermemesi için iki ayrı Supabase projesi kullanılır.

## Bilinen sınırlar

- Taranmış (görüntü tabanlı) PDF'lerde OCR desteği yok
- Vercel ücretsiz katmanında 60 saniye fonksiyon zaman aşımı nedeniyle dosya boyutu sınırlı
- Web arama aracı yer tutucu olarak duruyor
- Supabase ücretsiz katmanında saatte 2 e-posta gönderim sınırı var

## Yerel kurulum

```bash
npm install
cp .env.example .env.local   # değerleri doldurun
npm run dev
```

Gerekli ortam değişkenleri `.env.example` dosyasında listelenmiştir.
