
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tables } from "@/integrations/supabase/types"

type Agent = Tables<'agents'>

interface AgentConfiguration {
  evolution_instance_name?: string | null
}

interface DeleteAgentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  agent: Agent | null
  isDeleting?: boolean
}

export const DeleteAgentDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  agent, 
  isDeleting = false 
}: DeleteAgentDialogProps) => {
  
  const handleConfirm = async () => {
    if (!agent) return

    const configuration = agent.configuration as AgentConfiguration
    const instanceName = configuration?.evolution_instance_name

    if (instanceName && agent.whatsapp_contact) {
      try {
        console.log('🗑️ Enviando requisição para desconectar agente:', instanceName, agent.whatsapp_contact)
        
        const response = await fetch('https://webhook.abbadigital.com.br/webhook/desconecta-contato', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instanceName: instanceName,
            contato: agent.whatsapp_contact
          }),
        })

        console.log('📡 Resposta da requisição de exclusão:', response.status, response.statusText)

        if (!response.ok) {
          console.error('❌ Erro ao desconectar agente:', response.status, response.statusText)
          const errorText = await response.text()
          console.error('❌ Detalhes do erro:', errorText)
        } else {
          const responseData = await response.json()
          console.log('✅ Resposta do servidor:', responseData)
          console.log('✅ Agente desconectado com sucesso')
        }
      } catch (error) {
        console.error('❌ Erro ao enviar requisição de desconexão:', error)
      }
    }

    // Chama a função original para excluir do banco de dados
    onConfirm()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-abba-black border-abba-gray">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-abba-text">
            Excluir Agente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Tem certeza que deseja excluir o agente "{agent?.name}"? 
            Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            {agent?.whatsapp_contact && (
              <span className="block mt-2 text-orange-400">
                O WhatsApp conectado também será desconectado automaticamente.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-abba-gray border-abba-gray text-abba-text hover:bg-gray-700"
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
