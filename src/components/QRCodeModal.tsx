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
  const [connectionSuccess, setConnectionSuccess] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const { timeLeft, formattedTime, isExpired, reset } = useQRCodeTimer({
    isActive: open && !isPolling,
    duration: POLLING_CONFIG.qrExpiration,
    onExpire: () => {
      console.log("QR Code expirou, mas modal continua aberto")
    }
  })

  useEffect(() => {
    setCurrentQRCode(qrCodeBase64)
    reset()
  }, [qrCodeBase64, reset])

  useEffect(() => {
    if (open && currentQRCode && !connectionSuccess) {
      console.log('QR Code modal aberto - iniciando polling:', connectionName)
      startPolling()
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [open, currentQRCode, connectionName, connectionSuccess])

  const startPolling = () => {
    if (isPolling) return
    
    console.log('Iniciando polling para:', connectionName)
    setIsPolling(true)
    setRetryCount(0)
    
    pollingIntervalRef.current = setInterval(async () => {
      await checkConnectionStatus()
    }, POLLING_CONFIG.interval)
  }

  const stopPolling = () => {
    console.log('Parando polling')
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
        console.log('CONEXÃO ESTABELECIDA! Fechando modal em 2 segundos...')
        setConnectionSuccess(true)
        stopPolling()
        
        const profileData = {
          profileName: data.profilename || data.profileName || null,
          contact: data.contato || data.phone || data.wid || null,
          profilePictureUrl: data.fotodoperfil || data.profilePictureUrl || null
        }

        toast({
          title: "WhatsApp Conectado!",
          description: `Conexão "${connectionName}" estabelecida com sucesso.`
        })
        
        // Aguarda 2 segundos para mostrar o sucesso, depois fecha
        setTimeout(() => {
          onConnected(profileData)
        }, 2000)
        return
      }

      setRetryCount(prev => prev + 1)
      
    } catch (error) {
      console.error('Erro no polling:', error)
      setRetryCount(prev => prev + 1)
    }
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
        setRetryCount(0)
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

  const handleManualClose = () => {
    console.log('Usuário fechou o modal manualmente')
    setConnectionSuccess(false)
    stopPolling()
    onOpenChange(false)
  }

  // FORÇAR O MODAL A PERMANECER ABERTO
  const handleDialogChange = (openState: boolean) => {
    console.log('Dialog tentou mudar estado para:', openState)
    // NÃO PERMITIR FECHAR AUTOMATICAMENTE
    if (!openState && !connectionSuccess) {
      console.log('Bloqueando fechamento automático do modal')
      return
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Conectar WhatsApp</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Escaneie o QR Code com seu WhatsApp para conectar "{connectionName}"
          </p>

          {/* QR Code */}
          <div className="flex justify-center p-4 bg-muted rounded-lg mb-4">
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {connectionSuccess ? (
                <Badge className="bg-emerald-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conectado!
                </Badge>
              ) : isPolling && !isExpired ? (
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
              {connectionSuccess ? "Sucesso!" : isExpired ? "00:00" : formattedTime}
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1 mb-4">
            <p className="font-medium">Como conectar:</p>
            <p>1. Abra o WhatsApp no seu celular</p>
            <p>2. Toque em Mais opções → Aparelhos conectados</p>
            <p>3. Toque em "Conectar um aparelho"</p>
            <p>4. Escaneie este código QR</p>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            {isExpired && !connectionSuccess && (
              <Button
                onClick={generateNewQRCode}
                disabled={isGeneratingNewQR}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingNewQR ? 'animate-spin' : ''}`} />
                {isGeneratingNewQR ? "Gerando..." : "Novo QR Code"}
              </Button>
            )}
            
            {!connectionSuccess && (
              <Button
                variant="outline"
                onClick={handleManualClose}
                className={isExpired ? "flex-1" : "w-full"}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}