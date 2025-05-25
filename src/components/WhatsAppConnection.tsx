
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WhatsAppConnectionProps {
  instanceName: string
  onInstanceNameChange: (value: string) => void
  apiKey: string
  onApiKeyChange: (value: string) => void
  onConnect: () => Promise<void>
}

export const WhatsAppConnection = ({
  instanceName,
  onInstanceNameChange,
  apiKey,
  onApiKeyChange,
  onConnect
}: WhatsAppConnectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!instanceName.trim() || !apiKey.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome da instância e a chave API.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    setConnectionResult(null)

    try {
      await onConnect()
      setConnectionResult("teste feito com sucesso")
      toast({
        title: "Conexão realizada!",
        description: "WhatsApp conectado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error)
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar o WhatsApp. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="bg-abba-gray border-abba-gray">
      <CardHeader>
        <CardTitle className="text-abba-text flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          Configuração WhatsApp
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure a conexão com a API Evolution para este agente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-abba-text mb-2 block">
            Nome da Instância
          </label>
          <Input
            value={instanceName}
            onChange={(e) => onInstanceNameChange(e.target.value)}
            placeholder="Ex: meu-agente-vendas"
            className="bg-abba-black border-abba-gray text-abba-text"
          />
          <p className="text-xs text-gray-500 mt-1">
            Este será o nome usado na API Evolution
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-abba-text mb-2 block">
            Chave API Evolution
          </label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Sua chave API da Evolution"
            className="bg-abba-black border-abba-gray text-abba-text"
          />
        </div>

        <Button
          onClick={handleConnect}
          disabled={isConnecting || !instanceName.trim() || !apiKey.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            "Conectar WhatsApp"
          )}
        </Button>

        {connectionResult && (
          <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-md">
            <p className="text-green-400 text-sm font-medium">
              {connectionResult}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
