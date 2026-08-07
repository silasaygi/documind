import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'

export default async function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-stone-50">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}