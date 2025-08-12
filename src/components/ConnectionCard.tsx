import { MoreVertical, Power, Wifi } from "lucide-react"
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useToast } from "@/hooks/use-toast"
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
  avatarUrl
}: ConnectionCardProps) {
  const { toast } = useToast()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const connected = String(status).toLowerCase() === 'active' || String(status).toLowerCase() === 'connected'

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)

      const payload = {
        id,
        instanceName: instanceName || name,
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

  return (
    <Card aria-label={`Conexão ${name}`} className="bg-card border-border rounded-xl">
      <CardContent className="p-4 sm:p-5">
        {/* Top header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={`Foto do perfil ${name}`} loading="lazy" />
              )}
              <AvatarFallback>
                {name?.[0]?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg font-semibold text-foreground leading-5 truncate">{name}</CardTitle>
              {(profileName || instanceName) && (
                <p className="text-sm text-muted-foreground leading-5 truncate">{profileName || instanceName}</p>
              )}
              {phone && (
                <p className="text-sm text-muted-foreground leading-5 truncate">{phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Mais ações">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Renomear</DropdownMenuItem>
                <DropdownMenuItem>Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 border-t border-border/70" />

        {/* Info grid */}
        <section aria-label="Informações" className="mt-4 grid grid-cols-2 gap-y-2">
          <div className="text-sm text-muted-foreground">Status:</div>
          <div className="text-sm text-foreground">{connected ? "Conectado" : "Desconectado"}</div>

          <div className="text-sm text-muted-foreground">Criado em:</div>
          <div className="text-sm text-foreground">{formatDate(createdAt)}</div>

          <div className="text-sm text-muted-foreground">Última atividade:</div>
          <div className="text-sm text-foreground">{formatDate(updatedAt || createdAt)}</div>
        </section>

        {/* Disconnect button */}
        <div className="mt-5">
          <Button
            variant="outline"
            className="w-full justify-center border-destructive/30 text-destructive hover:bg-destructive/10"
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
