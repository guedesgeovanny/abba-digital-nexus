import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, Clock, Smartphone } from "lucide-react"
import { useQRCodeTimer } from "@/hooks/useQRCodeTimer"
import { WEBHOOK_URLS, POLLING_CONFIG, StatusResponse } from "@/utils/connectionValidation"
import { useToast } from "@/hooks/use-toast"

interface QRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connectionName: string
  qrCodeBase64: string
  onConnected: (profileData: any) => void
}

export function QRCodeModal({
  open,
  onOpenChange,
  connectionName,
  qrCodeBase64,
  onConnected
}: QRCodeModalProps) {
  const [isPolling, setIsPolling] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isGeneratingNewQR, setIsGeneratingNewQR] = useState(false)
  const [currentQRCode, setCurrentQRCode] = useState(qrCodeBase64)
  const pollingIntervalRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const { timeLeft, formattedTime, isExpired, reset } = useQRCodeTimer({
    isActive: open && !isPolling,
    duration: POLLING_CONFIG.qrExpiration,
    onExpire: () => {
      handleQRExpired()
    }
  })

  useEffect(() => {
    setCurrentQRCode(qrCodeBase64)
    reset()
  }, [qrCodeBase64, reset])

  useEffect(() => {
    if (open && currentQRCode) {
      console.log('Iniciando polling para verificar conexão:', connectionName)
      startPolling()
    } else {
      stopPolling()
      setRetryCount(0)
    }

    return () => stopPolling()
  }, [open, currentQRCode, connectionName])

  const startPolling = () => {
    if (isPolling) return
    
    setIsPolling(true)
    setRetryCount(0)
    
    pollingIntervalRef.current = setInterval(async () => {
      await checkConnectionStatus()
    }, POLLING_CONFIG.interval)
  }

  const stopPolling = () => {
    setIsPolling(false)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = undefined
    }
  }

  const checkConnectionStatus = async () => {
    try {
      console.log(`Verificando status da conexão: ${connectionName} (tentativa ${retryCount + 1}/${POLLING_CONFIG.maxRetries})`)
      
      const response = await Promise.race([
        fetch(`${WEBHOOK_URLS.CHECK_STATUS}?instanceName=${encodeURIComponent(connectionName)}`),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), POLLING_CONFIG.requestTimeout)
        )
      ]) as Response

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: StatusResponse = await response.json()
      console.log('Resposta do webhook de status:', data)
      
      const isConnected = data.connected === true || 
                         (typeof data.status === 'string' && 
                          ['open', 'connected', 'ready', 'active'].includes(data.status.toLowerCase()))

      if (isConnected) {
        console.log('Conexão estabelecida com sucesso!')
        const profileData = {
          profileName: data.profilename || data.profileName || null,
          contact: data.contato || data.phone || data.wid || null,
          profilePictureUrl: data.fotodoperfil || data.profilePictureUrl || null
        }

        stopPolling()
        toast({
          title: "WhatsApp Conectado!",
          description: `Conexão "${connectionName}" estabelecida com sucesso.`
        })
        
        // Só fecha o modal após conexão bem-sucedida
        setTimeout(() => {
          onConnected(profileData)
        }, 1000)
        return
      }

      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)
      
      if (newRetryCount >= POLLING_CONFIG.maxRetries) {
        console.log('Limite de tentativas atingido')
        stopPolling()
        toast({
          title: "Tempo limite excedido",
          description: "Escaneie o QR Code para conectar ou gere um novo código.",
          variant: "destructive"
        })
        // NÃO fecha o modal - deixa o usuário decidir
      }
    } catch (error) {
      console.error('Erro no polling:', error)
      const newRetryCount = retryCount + 1
      setRetryCount(newRetryCount)
      
      if (newRetryCount >= POLLING_CONFIG.maxRetries) {
        console.log('Limite de tentativas atingido por erro')
        stopPolling()
        toast({
          title: "Erro na verificação",
          description: "Verifique sua conexão. O QR Code continua válido.",
          variant: "destructive"
        })
        // NÃO fecha o modal - deixa o usuário decidir
      }
    }
  }

  const handleQRExpired = () => {
    toast({
      title: "QR Code expirado",
      description: "Gerando um novo código QR...",
      variant: "destructive"
    })
    generateNewQRCode()
  }

  const generateNewQRCode = async () => {
    try {
      setIsGeneratingNewQR(true)
      stopPolling()
      
      const response = await fetch(
        `${WEBHOOK_URLS.CONNECT}?connectionName=${encodeURIComponent(connectionName)}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      const newQRCode = data.base64 || data.result?.base64
      
      if (newQRCode) {
        const base64Url = newQRCode.startsWith('data:image') 
          ? newQRCode 
          : `data:image/png;base64,${newQRCode}`
        
        setCurrentQRCode(base64Url)
        reset()
        startPolling()
        
        toast({
          title: "Novo QR Code gerado",
          description: "Escaneie o novo código para conectar."
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
      setIsGeneratingNewQR(false)
    }
  }

  const handleClose = () => {
    console.log('Modal fechado pelo usuário')
    stopPolling()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar "{connectionName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-muted rounded-lg">
            {isGeneratingNewQR ? (
              <div className="flex flex-col items-center justify-center h-64 w-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Gerando novo QR...</p>
              </div>
            ) : (
              <img
                src={currentQRCode}
                alt="QR Code WhatsApp"
                className="w-64 h-64 object-contain"
              />
            )}
          </div>

          {/* Status e Timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPolling && !isExpired ? (
                <Badge variant="secondary" className="animate-pulse">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aguardando...
                </Badge>
              ) : isExpired ? (
                <Badge variant="destructive">
                  <Clock className="h-3 w-3 mr-1" />
                  Expirado
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Pronto
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isExpired ? "00:00" : formattedTime}
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
            <p className="font-medium">Como conectar:</p>
            <p>1. Abra o WhatsApp no seu celular</p>
            <p>2. Toque em Mais opções &gt; Aparelhos conectados</p>
            <p>3. Toque em "Conectar um aparelho"</p>
            <p>4. Escaneie este código QR</p>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            {isExpired && (
              <Button
                onClick={generateNewQRCode}
                disabled={isGeneratingNewQR}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingNewQR ? 'animate-spin' : ''}`} />
                {isGeneratingNewQR ? "Gerando..." : "Novo QR Code"}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleClose}
              className={isExpired ? "flex-1" : "w-full"}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}