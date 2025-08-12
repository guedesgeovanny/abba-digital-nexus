import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WhatsAppQRCodeTimer } from "@/components/WhatsAppQRCodeTimer"
import { useQRCodeTimer } from "@/hooks/useQRCodeTimer"
import { WEBHOOK_URLS, POLLING_CONFIG, StatusResponse } from "@/utils/connectionValidation"
import { useToast } from "@/hooks/use-toast"

interface QRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  qrCodeBase64?: string
  onConnected: (profileData: { profileName?: string; contact?: string; profilePictureUrl?: string }) => void
}

export function QRCodeModal({ 
  open, 
  onOpenChange, 
  connectionName, 
  qrCodeBase64,
  onConnected 
}: QRCodeModalProps) {
  const [currentQrCode, setCurrentQrCode] = useState(qrCodeBase64 || "")
  const [isPolling, setIsPolling] = useState(false)
  const [isGeneratingNewQr, setIsGeneratingNewQr] = useState(false)
  const { toast } = useToast()
  
  const { timeLeft, isExpired, resetTimer, formattedTime } = useQRCodeTimer({ 
    duration: POLLING_CONFIG.qrExpiration, 
    isActive: isPolling && open,
    onExpire: () => setIsPolling(false)
  })

  // Start polling when modal opens with QR code
  useEffect(() => {
    if (open && currentQrCode) {
      setIsPolling(true)
      resetTimer()
    } else {
      setIsPolling(false)
    }
  }, [open, currentQrCode, resetTimer])

  // Update QR code when prop changes
  useEffect(() => {
    if (qrCodeBase64) {
      setCurrentQrCode(qrCodeBase64)
    }
  }, [qrCodeBase64])

  // Polling logic
  useEffect(() => {
    if (!isPolling || isExpired || !open) return

    let retryCount = 0
    const interval = setInterval(async () => {
      if (retryCount >= POLLING_CONFIG.maxRetries) {
        setIsPolling(false)
        toast({
          title: "Tempo limite excedido",
          description: "Não foi possível conectar. Tente gerar um novo QR Code.",
          variant: "destructive"
        })
        return
      }

      try {
        const response = await Promise.race([
          fetch(`${WEBHOOK_URLS.CHECK_STATUS}?instanceName=${encodeURIComponent(connectionName)}`),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), POLLING_CONFIG.requestTimeout)
          )
        ]) as Response

        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        
        const data: StatusResponse = await response.json()
        
        // Check if connected
        const connected = data.connected === true || 
                         (typeof data.status === 'string' && 
                          ['open', 'connected', 'ready', 'active'].includes(data.status.toLowerCase()))

        if (connected) {
          const profileData = {
            profileName: data.profilename,
            contact: data.contato,
            profilePictureUrl: data.fotodoperfil
          }
          
          setIsPolling(false)
          onOpenChange(false)
          onConnected(profileData)
          
          toast({
            title: "WhatsApp Conectado!",
            description: "Sua conexão foi estabelecida com sucesso."
          })
          
          clearInterval(interval)
          return
        }

        retryCount++
      } catch (error) {
        console.error('Polling error:', error)
        retryCount++
      }
    }, POLLING_CONFIG.interval)

    return () => clearInterval(interval)
  }, [isPolling, isExpired, open, connectionName, onConnected, onOpenChange, toast])

  const generateNewQrCode = async () => {
    try {
      setIsGeneratingNewQr(true)
      
      const response = await fetch(
        `${WEBHOOK_URLS.CONNECT}?connectionName=${encodeURIComponent(connectionName)}`
      )
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      const newQrCode = data.base64 || data.result?.base64
      
      if (newQrCode) {
        const base64Url = newQrCode.startsWith('data:image') 
          ? newQrCode 
          : `data:image/png;base64,${newQrCode}`
        
        setCurrentQrCode(base64Url)
        setIsPolling(true)
        resetTimer()
        
        toast({
          title: "Novo QR Code gerado",
          description: "Escaneie o novo código com seu WhatsApp."
        })
      } else {
        throw new Error('QR Code não retornado')
      }
    } catch (error) {
      console.error('Error generating new QR:', error)
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar um novo código. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingNewQr(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code abaixo com seu WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {currentQrCode ? (
            <div className="bg-white p-4 rounded-lg">
              <img 
                src={currentQrCode} 
                alt="QR Code WhatsApp" 
                className="w-64 h-64 object-contain"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">QR Code não disponível</p>
            </div>
          )}
          
          <WhatsAppQRCodeTimer 
            timeLeft={timeLeft}
            isExpired={isExpired}
            formattedTime={formattedTime}
          />
          
          {isPolling && !isExpired && (
            <p className="text-sm text-muted-foreground">
              Aguardando conexão... Escaneie o código no seu WhatsApp
            </p>
          )}
          
          {isExpired && (
            <div className="text-center space-y-2">
              <p className="text-sm text-orange-600">QR Code expirado</p>
              <Button 
                onClick={generateNewQrCode}
                disabled={isGeneratingNewQr}
                size="sm"
              >
                {isGeneratingNewQr ? "Gerando..." : "Gerar Novo QR Code"}
              </Button>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Conexão: <strong>{connectionName}</strong></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}