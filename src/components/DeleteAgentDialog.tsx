
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
            onClick={onConfirm}
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
