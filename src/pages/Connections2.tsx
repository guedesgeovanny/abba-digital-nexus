import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
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
      .select("id, name, status, created_at, updated_at, profile_picture_url, configuration")
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
        <h1 className="text-2xl font-semibold text-abba-text">Conexões 2</h1>
        <Button className="bg-abba-green text-abba-black hover:bg-abba-green-light" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Conexão
        </Button>
      </div>

      <Card className="bg-abba-black border-abba-gray">
        <CardHeader>
          <CardTitle className="text-abba-text">Minhas conexões</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-400">Carregando…</p>
          ) : rows.length === 0 ? (
            <p className="text-gray-400">Nenhuma conexão ainda.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <ConnectionCard
                  key={r.id}
                  id={r.id}
                  name={r.name}
                  status={r.status}
                  createdAt={r.created_at}
                  updatedAt={r.updated_at}
                  instanceName={r.configuration?.evolution_instance_name}
                  avatarUrl={r.profile_picture_url || undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewWhatsAppConnectionDialog open={open} onOpenChange={(v) => setOpen(v)} onCreated={fetchRows} />
    </div>
  )
}
