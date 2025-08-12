import { Trash, Power, Wifi } from "lucide-react"
import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useState, useEffect, useRef } from "react"
import { useQRCodeTimer } from "@/hooks/useQRCodeTimer"
import { WhatsAppQRCodeTimer } from "@/components/WhatsAppQRCodeTimer"

// Webhook endpoints
const CREATE_INSTANCE_URL = "https://webhock-veterinup.abbadigital.com.br/webhook/nova-instancia-mp-brasil"
const DISCONNECT_URL = "https://webhock-veterinup.abbadigital.com.br/webhook/desconecta-mp-brasil"
const CONNECT_URL = "https://webhock-veterinup.abbadigital.com.br/webhook/conecta-mp-brasil"
const CHECK_STATUS_URL = "https://webhock-veterinup.abbadigital.com.br/webhook/verifica-status-mp-brasil"
const REQUEST_TIMEOUT_MS = 15000

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
  onSuccess?: (profile: { phone?: string; profileName?: string; profilePictureUrl?: string }) => void
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
  onDeleted,
  onSuccess
}: ConnectionCardProps) {
  const { toast } = useToast()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const initialConnected = String(status).toLowerCase() === 'active' || String(status).toLowerCase() === 'connected'
  const [localConnected, setLocalConnected] = useState(initialConnected)
  const connected = localConnected
  const [buttonMode, setButtonMode] = useState<'disconnect' | 'connect'>(initialConnected ? 'disconnect' : 'connect')
  const [isConnecting, setIsConnecting] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrData, setQrData] = useState<{ base64: string; code?: string } | null>(null)
  const [createdInstanceName, setCreatedInstanceName] = useState<string | null>(instanceName || name)
  const [isPolling, setIsPolling] = useState(false)
  const { timeLeft, isExpired, resetTimer, formattedTime } = useQRCodeTimer({ duration: 60, isActive: isPolling, onExpire: () => setIsPolling(false) })
  const pollErrorShownRef = useRef(false)

  const startConnectionFlow = async () => {
    try {
      setIsConnecting(true)
      const instance = createdInstanceName || instanceName || name
      const url = `${CONNECT_URL}?instanceName=${encodeURIComponent(instance)}&name=${encodeURIComponent(name)}`
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json().catch(() => ({} as any))
      const instanceId = json?.instanceId || json?.instance_id || json?.instance_name || json?.name || instance
      const rawBase64 = json?.base64 || json?.result?.base64
      const rawCode = json?.code || json?.result?.code
      const base64Url = typeof rawBase64 === 'string' && rawBase64.startsWith('data:image') ? rawBase64 : (rawBase64 ? `data:image/png;base64,${rawBase64}` : null)

      if (base64Url) {
        setQrData({ base64: base64Url, code: rawCode })
        setCreatedInstanceName(String(instanceId))
        setShowQR(true)
        setIsPolling(true)
        resetTimer()
      } else {
        toast({ title: 'QR Code não retornado. Tente novamente.', variant: 'destructive' })
      }

      // Atualiza local/DB
      setLocalConnected(false)
      setButtonMode('connect')
      await supabase.from('conexoes').update({
        status: 'inactive',
        configuration: {
          connection_status: 'disconnected',
          evolution_api_key: null,
          evolution_instance_name: instanceId
        }
      }).eq('id', id)
    } catch (e) {
      console.error(e)
      toast({ title: "Não foi possível gerar o QR Code agora.", variant: "destructive" })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)

      const payload = {
        instanceName: instanceName || name
      }

      const res = await fetch(DISCONNECT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      // Atualiza status local e no banco
      setLocalConnected(false)
      setButtonMode('connect')
      
      await supabase.from('conexoes').update({
        status: 'inactive'
      }).eq('id', id)

      toast({ title: "Desconectado com sucesso!" })
    } catch (error) {
      console.error(error)
      toast({
        title: "Falha ao desconectar",
        description: "Não foi possível completar a solicitação.",
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

  // Regenera QR Code via conecta-mp-brasil (GET)
  const regenerateQRCode = async () => {
    try {
      const instance = createdInstanceName || name
      const url = `${CONNECT_URL}?instanceName=${encodeURIComponent(instance)}&name=${encodeURIComponent(name)}`
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json().catch(() => ({}))
      const rawBase64 = json?.base64 || json?.result?.base64
      const rawCode = json?.code || json?.result?.code
      const base64Url = typeof rawBase64 === 'string' && rawBase64.startsWith('data:image') ? rawBase64 : (rawBase64 ? `data:image/png;base64,${rawBase64}` : null)
      if (base64Url) {
        setQrData({ base64: base64Url, code: rawCode })
        setShowQR(true)
        setIsPolling(true)
        resetTimer()
      } else {
        toast({ title: 'QR Code não retornado. Tente novamente.', variant: 'destructive' })
      }
    } catch (e) {
      console.error(e)
      toast({ title: 'Falha ao gerar novo QR Code.', variant: 'destructive' })
    }
  }

  // Inicia indicador de polling ao abrir o QR
  useEffect(() => {
    if (showQR) {
      setIsPolling(true)
      pollErrorShownRef.current = false
    } else {
      setIsPolling(false)
    }
  }, [showQR])

  // Polling periódico do status enquanto o QR estiver ativo
  useEffect(() => {
    if (!isPolling || isExpired || connected) return
    
    const instance = name  // Sempre usar o nome da conexão
    let stopped = false
    
    const interval = setInterval(async () => {
      if (stopped) return
      try {
        const res = await Promise.race([
          fetch(`${CHECK_STATUS_URL}?instanceName=${encodeURIComponent(instance)}`, { method: 'GET' }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT_MS))
        ]) as Response
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json().catch(() => ({}))
        
        const statusStr = String(json?.connection_status ?? json?.status ?? '').toLowerCase()
        const gotConnected = statusStr === 'connected' || json?.connected === true
        
        if (gotConnected) {
          const profilePicture = json?.fotodoperfil 
            || json?.profilePictureUrl 
            || json?.profile_picture_url 
            || json?.result?.fotodoperfil 
            || json?.result?.profilePictureUrl 
            || json?.result?.profile_picture_url 
            || null
          const profileNameNext = json?.profileName 
            || json?.result?.profileName 
            || json?.profilename 
            || json?.result?.profilename 
            || null
          const phoneNext = json?.contato 
            || json?.phone 
            || json?.wid 
            || json?.result?.contato 
            || json?.result?.phone 
            || json?.result?.wid 
            || null
            
          await supabase.from('conexoes').update({
            status: 'active',
            whatsapp_profile_picture_url: profilePicture,
            whatsapp_profile_name: profileNameNext,
            whatsapp_contact: phoneNext
          }).eq('id', id)
          
          onSuccess?.({ phone: phoneNext ?? undefined, profileName: profileNameNext ?? undefined, profilePictureUrl: profilePicture ?? undefined })
          setLocalConnected(true)
          setButtonMode('disconnect')
          setIsPolling(false)
          setShowQR(false)
          toast({ title: 'Conectado com sucesso!' })
          clearInterval(interval)
          stopped = true
        }
      } catch (err) {
        if (!pollErrorShownRef.current) {
          toast({ title: 'Falha ao verificar status', description: 'Tentando novamente...', variant: 'default' })
          pollErrorShownRef.current = true
        }
      }
    }, 3000)
    
    return () => { stopped = true; clearInterval(interval) }
  }, [isPolling, isExpired, connected, name, id, onSuccess])

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

        {/* Action button */}
        <div className="mt-5">
          <Button
            variant="outline"
            className="w-full justify-center border-input text-foreground hover:bg-accent"
            onClick={buttonMode === 'disconnect' ? handleDisconnect : startConnectionFlow}
            disabled={buttonMode === 'disconnect' ? isDisconnecting : isConnecting}
            aria-busy={buttonMode === 'disconnect' ? isDisconnecting : isConnecting}
          >
            {buttonMode === 'disconnect' ? (
              <>
                <Power className={`mr-2 h-4 w-4 ${isDisconnecting ? "animate-spin" : ""}`} /> {isDisconnecting ? "Desconectando..." : "Desconectar"}
              </>
            ) : (
              <>
                <Wifi className={`mr-2 h-4 w-4 ${isConnecting ? "animate-spin" : ""}`} /> {isConnecting ? "Conectando..." : "Conectar"}
              </>
            )}
          </Button>
        </div>

        {/* QR Code Dialog */}
        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Escaneie o QR Code</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Instância: {createdInstanceName || name}
              </DialogDescription>
            </DialogHeader>
            <div className="w-full flex flex-col items-center gap-3">
              {qrData?.base64 ? (
                <img src={qrData.base64} alt="QR Code WhatsApp" className="w-48 h-48 bg-white p-2 rounded" />
              ) : (
                <p className="text-sm text-muted-foreground">QR Code não disponível.</p>
              )}
              {qrData?.code && (
                <p className="text-xs text-muted-foreground break-all">Código: {qrData.code}</p>
              )}
              <WhatsAppQRCodeTimer timeLeft={timeLeft} isExpired={isExpired} formattedTime={formattedTime} />
              {isPolling && !isExpired && (
                <p className="text-xs text-muted-foreground">Verificando conexão…</p>
              )}
              {isExpired && (
                <Button variant="outline" onClick={regenerateQRCode}>Gerar novo QR Code</Button>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQR(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
