import { Trash, Power, Wifi } from "lucide-react"
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"

import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"

interface ConnectionCardProps {
  id: string
  name: string
  status: string
  createdAt: string
  updatedAt?: string
  instanceName?: string
  profileName?: string
  phone?: string
  avatarUrl?: string
  channel?: string
  onDeleted?: (id: string) => void
}

const formatDate = (iso?: string) => {
  if (!iso) return "—"
  try {
    const d = new Date(iso)
    const date = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(d)
    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    }).format(d)
    return `${date}, ${time}`
  } catch {
    return "—"
  }
}

export function ConnectionCard({
  id,
  name,
  status,
  createdAt,
  updatedAt,
  instanceName,
  profileName,
  phone,
  avatarUrl,
  channel,
  onDeleted
}: ConnectionCardProps) {
  const { toast } = useToast()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const connected = String(status).toLowerCase() === 'active' || String(status).toLowerCase() === 'connected'

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)

      const payload = {
        instanceName: name,
        contact: phone,
        profileName,
      }

      const res = await fetch(
        "https://webhock-veterinup.abbadigital.com.br/webhook/desconecta-mp-brasil",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      toast({
        title: "Desconexão solicitada",
        description: "Enviamos sua solicitação ao servidor.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Falha ao desconectar",
        description: "Não foi possível enviar a solicitação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const payload = {
        instanceName: name,
        name,
      }
      const res = await fetch(
        "https://webhock-veterinup.abbadigital.com.br/webhook/desconecta-contato",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      // Exclui também do banco de dados
      const { error: dbError } = await supabase.from('conexoes').delete().eq('id', id)
      if (dbError) throw dbError

      toast({
        title: "Conexão excluída",
        description: "A conexão foi removida do banco de dados.",
      })
      onDeleted?.(id)
    } catch (error) {
      console.error(error)
      toast({
        title: "Falha ao excluir",
        description: "Não foi possível excluir a conexão. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card aria-label={`Conexão ${name}`} className="bg-card border-border rounded-xl">
      <CardContent className="p-4 sm:p-5">
        {/* Top header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={`Foto do perfil ${name}`} loading="lazy" />
              )}
              <AvatarFallback>
                {name?.[0]?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground leading-5 truncate">
                {name || "Novo"}
              </div>
              <div className="text-sm text-muted-foreground leading-5 truncate">
                {profileName || instanceName || "—"}
              </div>
              <div className="text-sm text-muted-foreground leading-5 truncate">
                {phone || "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={[
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                connected ? "bg-abba-green text-white" : "bg-muted text-muted-foreground"
              ].join(" ")}
              aria-label={`Status: ${connected ? "Conectado" : "Desconectado"}`}
            >
              <Wifi className="h-3.5 w-3.5 mr-1" />
              {connected ? "Conectado" : "Desconectado"}
            </span>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Excluir conexão"
                  className="text-destructive hover:bg-destructive/15"
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir conexão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a conexão "{name}"? Esta ação não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 border-t border-border/70" />

        {/* Info grid */}
        <section aria-label="Informações" className="mt-4 grid grid-cols-2 gap-y-2">
          <div className="text-sm text-muted-foreground">Status:</div>
          <div className="text-sm text-foreground">{connected ? "Conectado" : "Desconectado"}</div>

          <div className="text-sm text-muted-foreground">Canal:</div>
          <div className="text-sm text-foreground">{channel || "—"}</div>

          <div className="text-sm text-muted-foreground">Criado em:</div>
          <div className="text-sm text-foreground">{formatDate(createdAt)}</div>

          <div className="text-sm text-muted-foreground">Última atividade:</div>
          <div className="text-sm text-foreground">{formatDate(updatedAt || createdAt)}</div>
        </section>

        {/* Disconnect button */}
        <div className="mt-5">
          <Button
            variant="outline"
            className="w-full justify-center border-destructive/50 text-destructive hover:bg-destructive/50"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            aria-busy={isDisconnecting}
          >
            <Power className={`mr-2 h-4 w-4 ${isDisconnecting ? "animate-spin" : ""}`} /> {isDisconnecting ? "Desconectando..." : "Desconectar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
