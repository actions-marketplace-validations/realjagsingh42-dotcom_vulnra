import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MCPServerScanner from '@/components/mcp-scanner/MCPServerScanner'

export default async function MCPScannerPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return <MCPServerScanner user={data.user} />
}