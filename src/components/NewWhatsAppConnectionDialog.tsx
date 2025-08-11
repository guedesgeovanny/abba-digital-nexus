import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

// Configuráveis
const EVOLUTION_API_BASE_URL = "https://SUA-API-EVOLUTION"
const REQUEST_TIMEOUT_MS = 15000

interface NewWhatsAppConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function NewWhatsAppConnectionDialog({ open, onOpenChange, onCreated }: NewWhatsAppConnectionDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const validateName = (value: string): string | null => {
    if (!value) return "Nome da conexão é obrigatório"
    if (value.includes(" ")) return "O nome da conexão não pode conter espaços"
    if (value.length < 3) return "Nome deve ter pelo menos 3 caracteres"
    if (value.length > 30) return "Nome deve ter no máximo 30 caracteres"
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return "Apenas letras, números, underscore (_) e hífen (-) são permitidos"
    return null
  }

  const disabled = useMemo(() => submitting, [submitting])

  const reset = () => {
    setName("")
    setError(null)
  }

  const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), ms)
    try {
      // @ts-ignore
      const result = await promise(controller.signal)
      return result
    } finally {
      clearTimeout(timeout)
    }
  }

  const createExternalInstance = async (connectionName: string) => {
    const url = `${EVOLUTION_API_BASE_URL}/instances`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Substitua por Edge Function e secrets do Supabase para guardar a API key com segurança
        // Authorization: `Bearer ${EVOLUTION_API_KEY}`
      },
      body: JSON.stringify({ name: connectionName })
    })

    if (!response.ok) {
      throw new Error("api_error")
    }

    const json = await response.json()
    // Esperado: { instance_id, name, status }
    if (!json?.instance_id) {
      throw new Error("invalid_response")
    }
    return json as { instance_id: string; name: string; status?: string; metadata?: any }
  }

  const rollbackExternalInstance = async (instanceId: string) => {
    try {
      const url = `${EVOLUTION_API_BASE_URL}/instances/${instanceId}`
      await fetch(url, { method: "DELETE" })
    } catch (e) {
      console.error("Rollback falhou:", e)
    }
  }

  const handleContinue = async () => {
    const validation = validateName(name)
    setError(validation)
    if (validation) return

    setSubmitting(true)
    try {
      // 1) Criar instância na API externa (com timeout)
      const external = await Promise.race([
        createExternalInstance(name),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), REQUEST_TIMEOUT_MS))
      ]) as { instance_id: string; status?: string }

      // 2) Inserir no Supabase
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) {
        throw new Error("no_auth")
      }

      const status = external.status && ["ready", "connected"].includes(external.status) ? "active" : "inactive"
      const insertPayload = {
        user_id: userId,
        type: "whatsapp",
        channel: "whatsapp",
        name,
        status,
        configuration: {
          connection_status: "disconnected",
          evolution_api_key: null,
          evolution_instance_name: external.instance_id
        }
      }

      const { error: dbError } = await supabase.from("conexoes").insert(insertPayload)
      if (dbError) {
        await rollbackExternalInstance(external.instance_id)
        if ((dbError as any).code === "23505") {
          throw new Error("duplicate")
        }
        throw new Error("db_error")
      }

      toast({ title: "Conexão criada com sucesso!" })
      reset()
      onOpenChange(false)
      onCreated?.()
    } catch (err: any) {
      if (err?.message === "timeout") {
        toast({ title: "Tempo de resposta excedido. Tente novamente.", variant: "destructive" })
      } else if (err?.message === "api_error") {
        toast({ title: "Não foi possível criar a instância. Tente novamente.", variant: "destructive" })
      } else if (err?.message === "db_error") {
        toast({ title: "Falha ao salvar a conexão. Operação revertida.", variant: "destructive" })
      } else if (err?.message === "duplicate") {
        toast({ title: "Já existe uma conexão com esse nome.", variant: "destructive" })
      } else if (err?.message === "no_auth") {
        toast({ title: "Você precisa estar autenticado para criar conexões.", variant: "destructive" })
      } else {
        toast({ title: "Serviço indisponível no momento. Tente novamente.", variant: "destructive" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!submitting) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="bg-abba-black border-abba-gray">
        <DialogHeader>
          <DialogTitle className="text-abba-text">Nova Conexão WhatsApp</DialogTitle>
          <DialogDescription className="text-gray-400">Informe um nome para a conexão</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm text-abba-text">Nome da Conexão</label>
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(validateName(e.target.value)); }}
            disabled={disabled}
            placeholder="ex.: atendimento_principal"
            className="bg-abba-black border-abba-gray text-abba-text placeholder:text-gray-500"
          />
          <p className="text-xs text-gray-400">Apenas letras, números, underscore (_) e hífen (-). Sem espaços.</p>
          {error && (<p className="text-xs text-red-400">{error}</p>)}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>Cancelar</Button>
          <Button className="bg-abba-green text-abba-black hover:bg-abba-green-light" onClick={handleContinue} disabled={disabled}>
            {submitting ? "Criando…" : "Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
