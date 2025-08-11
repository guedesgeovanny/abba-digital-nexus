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
    <Card className="bg-abba-black border-abba-gray p-4" aria-label={`Conexão ${name}`}>
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <Avatar className="h-10 w-10">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={`Foto do perfil ${name}`} loading="lazy" />}
          <AvatarFallback className="bg-abba-gray/20 text-abba-text">
            {name?.[0]?.toUpperCase() || 'C'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-abba-text truncate">{name}</h3>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {profileName || instanceName || 'Instância não informada'}
              </p>
              {phone && (
                <p className="text-xs text-gray-500 truncate">{phone}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-abba-text/80">Status:</span>
                <span aria-label={`Status: ${connected ? 'Conectado' : 'Desconectado'}`} className={`px-2 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 ${connected ? 'bg-abba-green text-abba-black' : 'bg-abba-gray text-abba-text'}`}>
                  <Wifi className="h-3 w-3" /> {connected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-abba-text hover:bg-white/5">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-abba-black border-abba-gray text-abba-text">
                  <DropdownMenuItem className="focus:bg-white/5">Renomear</DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/5">Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
            <div className="text-xs sm:text-sm text-abba-text/80">Criado em:</div>
            <div className="text-right text-xs sm:text-sm text-abba-text/80">{formatDate(createdAt)}</div>
            <div className="text-xs sm:text-sm text-abba-text/80">Última atividade:</div>
            <div className="text-right text-xs sm:text-sm text-abba-text/80">{formatDate(updatedAt || createdAt)}</div>
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full sm:w-auto border-abba-gray text-abba-text" onClick={handleDisconnect}>
              <Power className="mr-2 h-4 w-4" /> Desconectar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
