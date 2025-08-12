import { useState } from "react"
import { Trash, Power, Wifi, MoreVertical, Smartphone, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import QrPolling from "./QrPolling"
import { WEBHOOK_URLS } from "@/utils/connectionValidation"
import { useToast } from "@/hooks/use-toast"

interface InstanceCardProps {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'connecting'
  profileName?: string
  contact?: string
  profilePictureUrl?: string
  connectedAt?: string
  createdAt: string
  onStatusChange: (id: string, newStatus: 'connected' | 'disconnected' | 'connecting', profileData?: any) => void
  onDelete: (id: string) => void
}

export function InstanceCard({
  id,
  name,
  status,
  profileName,
  contact,
  profilePictureUrl,
  connectedAt,
  createdAt,
  onStatusChange,
  onDelete
}: InstanceCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string>("")
  const { toast } = useToast()

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-emerald-500 text-white"><Wifi className="h-3 w-3 mr-1" />Conectado</Badge>
      case 'connecting':
        return <Badge variant="secondary"><Smartphone className="h-3 w-3 mr-1" />QR Code</Badge>
      default:
        return <Badge variant="destructive"><Power className="h-3 w-3 mr-1" />Desconectado</Badge>
    }
  }

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      
      const response = await fetch(
        `${WEBHOOK_URLS.CONNECT}?connectionName=${encodeURIComponent(name)}`
      )
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      const qrCode = data.base64 || data.result?.base64
      
      if (qrCode) {
        // Usar o QR como está, já que agora o QrPolling lida com ambos os formatos
        setQrCodeData(qrCode)
        setShowQrModal(true)
        onStatusChange(id, 'connecting')
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o código no modal para conectar."
        })
      } else {
        throw new Error('QR Code não retornado')
      }
    } catch (error) {
      console.error('Connect error:', error)
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível gerar o QR Code. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)
      
      const response = await fetch(WEBHOOK_URLS.DISCONNECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: name })
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      onStatusChange(id, 'disconnected')
      
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso."
      })
    } catch (error) {
      console.error('Disconnect error:', error)
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(WEBHOOK_URLS.DELETE_INSTANCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          instanceName: name,
          name: name
        })
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      onDelete(id)
      
      toast({
        title: "Conexão excluída",
        description: "A conexão foi removida com sucesso."
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a conexão. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConnected = (profileData: any) => {
    setShowQrModal(false)
    onStatusChange(id, 'connected', profileData)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                {profilePictureUrl && (
                  <AvatarImage src={profilePictureUrl} alt={`${name} profile`} />
                )}
                <AvatarFallback>
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                {profileName && (
                  <p className="text-sm text-muted-foreground">{profileName}</p>
                )}
                {contact && (
                  <p className="text-xs text-muted-foreground">{contact}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {status === 'connected' ? (
                    <DropdownMenuItem 
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {isDisconnecting ? "Desconectando..." : "Desconectar"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem 
                      onClick={handleConnect}
                      disabled={isConnecting || status === 'connecting'}
                    >
                      <Wifi className="mr-2 h-4 w-4" />
                      {isConnecting ? "Conectando..." : "Conectar"}
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir conexão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a conexão "{name}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Criado em:</span>
              <span>{formatDate(createdAt)}</span>
            </div>
            
            {connectedAt && (
              <div className="flex justify-between">
                <span>Conectado em:</span>
                <span>{formatDate(connectedAt)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Canal:</span>
              <span>WhatsApp</span>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="mt-4 pt-4 border-t">
            {status === 'connected' ? (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                <Power className="mr-2 h-4 w-4" />
                {isDisconnecting ? "Desconectando..." : "Desconectar"}
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleConnect}
                disabled={isConnecting || status === 'connecting'}
              >
                <Wifi className="mr-2 h-4 w-4" />
                {isConnecting ? "Conectando..." : "Conectar WhatsApp"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Conectar WhatsApp - {name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowQrModal(false)}>
                ✕
              </Button>
            </div>
            <QrPolling
              instance={name}
              endpoint={WEBHOOK_URLS.CONNECT}
              initialQr={qrCodeData}
            />
          </div>
        </div>
      )}
    </>
  )
}