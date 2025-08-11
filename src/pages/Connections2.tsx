import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, RotateCw } from "lucide-react"
import { NewWhatsAppConnectionDialog } from "@/components/NewWhatsAppConnectionDialog"
import { supabase } from "@/integrations/supabase/client"
import { ConnectionCard } from "@/components/ConnectionCard"

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
  const [rows, setRows] = useState<ConnectionRow[]>([])

  const fetchRows = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("conexoes")
      .select("id, name, status, created_at, updated_at, profile_picture_url, profile_name, contact, configuration")
      .order("created_at", { ascending: false })
    if (!error) setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRows()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-abba-text">Suas Conexões</h1>
          <p className="text-sm text-gray-400">Gerencie suas conexões com o WhatsApp</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-abba-gray text-abba-text" onClick={fetchRows}>
            <RotateCw className="mr-2 h-4 w-4" /> Verificar Agora
          </Button>
          <Button className="bg-abba-black text-abba-text border border-abba-gray hover:bg-white/5" onClick={() => setOpen(true)}>
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
            />
          ))}
        </div>
      )}

      <NewWhatsAppConnectionDialog open={open} onOpenChange={(v) => setOpen(v)} onCreated={fetchRows} />
    </div>
  )
}
