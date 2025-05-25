
import { useState } from "react"
import { AgentFormField } from "@/components/AgentFormField"
import { WhatsAppConnection } from "@/components/WhatsAppConnection"
import { getTypeOptions, getStatusOptions, getChannelOptions } from "@/components/AgentFormOptions"
import { Tables } from "@/integrations/supabase/types"

type AgentType = Tables<'agents'>['type']
type AgentStatus = Tables<'agents'>['status']
type AgentChannel = Tables<'agents'>['channel']

interface AgentFormData {
  name: string
  type: AgentType
  status: AgentStatus
  description: string
  channel: AgentChannel
}

interface AgentFormProps {
  formData: AgentFormData
  setFormData: (data: AgentFormData) => void
  onWhatsAppConnect: () => Promise<{ code?: string; base64?: string; message?: string }>
  agentId?: string | null
}

export const AgentForm = ({ formData, setFormData, onWhatsAppConnect, agentId }: AgentFormProps) => {
  // Gerar o instanceName da mesma forma que no CreateAgentDialog
  const instanceName = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <div className="space-y-4">
      <AgentFormField
        label="Nome do Agente"
        type="input"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        placeholder="Ex: Agente Vendas Pro"
        required
      />

      <AgentFormField
        label="Tipo do Agente"
        type="select"
        value={formData.type}
        onChange={(value) => setFormData({ ...formData, type: value as AgentType })}
        placeholder="Selecione o tipo"
        options={getTypeOptions()}
        required
      />

      <AgentFormField
        label="Canal de Comunicação"
        type="select"
        value={formData.channel || ""}
        onChange={(value) => setFormData({ ...formData, channel: value as AgentChannel })}
        placeholder="Selecione o canal"
        options={getChannelOptions()}
      />

      <AgentFormField
        label="Status Inicial"
        type="select"
        value={formData.status}
        onChange={(value) => setFormData({ ...formData, status: value as AgentStatus })}
        options={getStatusOptions()}
      />

      <AgentFormField
        label="Descrição (Opcional)"
        type="textarea"
        value={formData.description}
        onChange={(value) => setFormData({ ...formData, description: value })}
        placeholder="Descreva o propósito e funcionalidades do agente..."
        rows={3}
      />

      {formData.channel === 'whatsapp' && (
        <WhatsAppConnection 
          onConnect={onWhatsAppConnect} 
          instanceName={instanceName}
          agentId={agentId}
        />
      )}
    </div>
  )
}
