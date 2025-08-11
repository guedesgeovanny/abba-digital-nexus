import { MoreVertical, Power, Wifi, Calendar, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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
    <Card aria-label={`Conexão ${name}`}>
      <CardHeader className="p-5 sm:p-6 pb-3">
        <div className="flex w-full items-start gap-4 sm:gap-5">
          <Avatar className="h-12 w-12 shrink-0">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} alt={`Foto do perfil ${name}`} loading="lazy" />
            )}
            <AvatarFallback>
              {name?.[0]?.toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg truncate">{name}</CardTitle>
            {(instanceName || profileName) && (
              <CardDescription className="truncate">
                {profileName || instanceName}
              </CardDescription>
            )}
            <p className="text-sm text-muted-foreground truncate">
              {[id, phone].filter(Boolean).join(" • ")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={connected ? "secondary" : "destructive"}
              className="px-2.5 py-1 text-xs sm:text-sm"
              aria-label={`Status: ${connected ? "Conectado" : "Desconectado"}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Wifi className="h-4 w-4" /> {connected ? "Conectado" : "Desconectado"}
              </span>
            </Badge>

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
      </CardHeader>

      <CardContent className="pt-0">
        <section aria-label="Informações de tempo" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Criado em</span>
            </div>
            <div className="text-sm">{formatDate(createdAt)}</div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última atividade</span>
            </div>
            <div className="text-sm">{formatDate(updatedAt || createdAt)}</div>
          </div>
        </section>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant={connected ? "destructiveOutline" : "outline"}
          className="w-full justify-center"
          onClick={handleDisconnect}
        >
          <Power className="mr-2 h-4 w-4" /> Desconectar
        </Button>
      </CardFooter>
    </Card>
  )
}
