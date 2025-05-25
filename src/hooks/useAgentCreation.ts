
import { useState } from 'react'

export const useAgentCreation = () => {
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const openDialog = () => {
    setCreatedAgentId(null)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setCreatedAgentId(null)
  }

  const setAgentId = (id: string) => {
    setCreatedAgentId(id)
  }

  return {
    createdAgentId,
    isDialogOpen,
    openDialog,
    closeDialog,
    setAgentId
  }
}
