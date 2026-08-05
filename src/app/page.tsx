import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('documents').select('id').limit(1)

  return (
    <main className="p-10 font-mono text-sm">
      <h1 className="mb-4 text-lg">Supabase bağlantı testi</h1>
      <p>Hata: {error ? error.message : 'yok'}</p>
      <p>Satır sayısı: {data?.length ?? 0}</p>
    </main>
  )
}