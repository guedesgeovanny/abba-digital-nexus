import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, RotateCw } from "lucide-react"
import { NewWhatsAppConnectionDialog } from "@/components/NewWhatsAppConnectionDialog"
import { supabase } from "@/integrations/supabase/client"
import { ConnectionCard } from "@/components/ConnectionCard"
import { useToast } from "@/hooks/use-toast"

// Webhook de verificação (mesmo do polling)
const CHECK_STATUS_URL = "https://webhock-veterinup.abbadigital.com.br/webhook/verifica-status-mp-brasil"
const REQUEST_TIMEOUT_MS = 15000

interface ConnectionRow {
  id: string
  name: string
  status: string
  created_at: string
  updated_at?: string
  profile_picture_url?: string | null
  profile_name?: string | null
  contact?: string | null
  configuration: any
}

export default function Connections2() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [rows, setRows] = useState<ConnectionRow[]>([])
  const { toast } = useToast()

  const fetchRows = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("conexoes")
      .select("id, name, status, created_at, updated_at, whatsapp_profile_picture_url, whatsapp_profile_name, whatsapp_contact, configuration")
      .order("created_at", { ascending: false })
    if (!error) setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRows()
  }, [])

  const verifyAll = async () => {
    setVerifying(true)
    try {
      await Promise.allSettled(rows.map(async (r) => {
        const instanceName = r.name
        if (!instanceName) return
        const res = await Promise.race([
          fetch(`${CHECK_STATUS_URL}?instanceName=${encodeURIComponent(instanceName)}`, {
            method: 'GET',
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT_MS))
        ]) as Response
        if (!res.ok) throw new Error('poll_error')
        const json = await res.json().catch(() => ({}))
        const statusRaw = json?.status ?? json?.connection_status ?? json?.state
        const connected = typeof statusRaw === 'string' && ['open','connected','ready','active'].includes(String(statusRaw).toLowerCase())
        const profilePicture = json?.fotodoperfil 
          || json?.profilePictureUrl 
          || json?.profile_picture_url 
          || json?.result?.fotodoperfil 
          || json?.result?.profilePictureUrl 
          || json?.result?.profile_picture_url 
          || null
        const profileName = json?.profileName 
          || json?.result?.profileName 
          || json?.profilename 
          || json?.result?.profilename 
          || null
        const phone = json?.contato 
          || json?.phone 
          || json?.wid 
          || json?.result?.contato 
          || json?.result?.phone 
          || json?.result?.wid 
          || null
        await supabase.from('conexoes').update({
          status: connected ? 'active' : 'inactive',
          profile_picture_url: profilePicture,
          profile_name: profileName,
          contact: phone
        }).eq('id', r.id)
      }))
      toast({ title: 'Verificação concluída' })
    } catch (e) {
      toast({ title: 'Falha ao verificar conexões', variant: 'destructive' })
    } finally {
      setVerifying(false)
      fetchRows()
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-abba-text">Suas Conexões</h1>
          <p className="text-sm text-gray-400">Gerencie suas conexões com o WhatsApp</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="w-full sm:w-auto border-abba-gray text-abba-text" onClick={verifyAll} disabled={verifying || loading}>
            <RotateCw className={`mr-2 h-4 w-4 ${verifying ? 'animate-spin' : ''}`} /> {verifying ? 'Verificando...' : 'Verificar Agora'}
          </Button>
          <Button className="w-full sm:w-auto bg-abba-green text-abba-black hover:bg-abba-green/90 border border-transparent" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Conexão
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-400">Nenhuma conexão ainda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <ConnectionCard
              key={r.id}
              id={r.id}
              name={r.name}
              status={r.status}
              createdAt={r.created_at}
              updatedAt={r.updated_at}
              instanceName={r.configuration?.evolution_instance_name}
              profileName={r.profile_name || undefined}
              phone={r.contact || undefined}
              avatarUrl={r.profile_picture_url || undefined}
              onDeleted={fetchRows}
            />
          ))}
        </div>
      )}

      <NewWhatsAppConnectionDialog open={open} onOpenChange={(v) => setOpen(v)} onCreated={fetchRows} />
    </div>
  )
}
