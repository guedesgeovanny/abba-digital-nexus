import { MoreVertical, Power, Wifi } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

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
  if (!iso) return "-"
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso))
  } catch {
    return "-"
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

  const connected = String(status).toLowerCase() === 'active' || String(status).toLowerCase() === 'connected'

  const handleDisconnect = () => {
    toast({ title: 'Ação indisponível no momento', description: 'Desconectar será implementado em breve.', variant: 'default' })
  }

  return (
    <Card className="p-5 sm:p-6" aria-label={`Conexão ${name}`}>
      <div className="flex items-center gap-4 md:gap-5 w-full">
        <Avatar className="h-12 w-12">
          {avatarUrl && (
            <AvatarImage src={avatarUrl} alt={`Foto do perfil ${name}`} loading="lazy" />
          )}
          <AvatarFallback>
            {name?.[0]?.toUpperCase() || "C"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Cabeçalho: Nome, perfil e telefone */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">{name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {profileName || instanceName || "Instância não informada"}
              </p>
              {phone && (
                <p className="text-sm text-muted-foreground truncate">{phone}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Renomear</DropdownMenuItem>
                <DropdownMenuItem>Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Corpo: Status, Criado em, Última atividade */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 items-center">
            <div className="text-sm text-muted-foreground">Status:</div>
            <div className="text-right">
              <span
                aria-label={`Status: ${connected ? "Conectado" : "Desconectado"}`}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  connected ? "bg-green-500/90 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                <Wifi className="h-3 w-3" /> {connected ? "Conectado" : "Desconectado"}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">Criado em:</div>
            <div className="text-right text-sm text-muted-foreground">{formatDate(createdAt)}</div>

            <div className="text-sm text-muted-foreground">Última atividade:</div>
            <div className="text-right text-sm text-muted-foreground">{formatDate(updatedAt || createdAt)}</div>
          </div>

          {/* Rodapé: Botão desconectar */}
          <div className="mt-4 border-t pt-4">
            <Button variant="outline" className="w-full justify-center" onClick={handleDisconnect}>
              <Power className="mr-2 h-4 w-4" /> Desconectar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
