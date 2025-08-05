
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types'
import { useAuth } from '@/contexts/AuthContext'

type Agent = Tables<'agents'>
type AgentWithMetrics = Agent & {
  agent_metrics?: Tables<'agent_metrics'>[]
}
type AgentInsert = TablesInsert<'agents'>
type AgentUpdate = TablesUpdate<'agents'>

export const useAgents = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const agentsQuery = useQuery({
    queryKey: ['agents', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          agent_metrics (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching agents:', error)
        throw error
      }

      return data as AgentWithMetrics[]
    },
    enabled: !!user?.id,
  })

  const createAgentMutation = useMutation({
    mutationFn: async (agentData: Omit<AgentInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('agents')
        .insert([{ ...agentData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: AgentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const updateAgentMetricsMutation = useMutation({
    mutationFn: async ({
      agentId,
      conversations_count,
      success_rate,
    }: {
      agentId: string
      conversations_count?: number
      success_rate?: number
    }) => {
      const { data, error } = await supabase
        .from('agent_metrics')
        .update({
          conversations_count,
          success_rate,
          last_activity: new Date().toISOString(),
        })
        .eq('agent_id', agentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const updateAgentWhatsAppProfile = useMutation({
    mutationFn: async ({
      agentId,
      profileName,
      contact,
      profilePictureUrl,
      profilePictureData,
    }: {
      agentId: string
      profileName: string
      contact: string
      profilePictureUrl?: string
      profilePictureData?: string
    }) => {
      console.log('💾 Atualizando perfil WhatsApp do agente:', {
        agentId,
        profileName,
        contact,
        profilePictureUrl: profilePictureUrl ? 'presente' : 'ausente',
        profilePictureData: profilePictureData ? 'presente' : 'ausente'
      })

      const { data, error } = await supabase
        .from('agents')
        .update({
          whatsapp_profile_name: profileName,
          whatsapp_contact: contact,
          whatsapp_profile_picture_url: profilePictureUrl,
          whatsapp_profile_picture_data: profilePictureData,
          whatsapp_connected_at: new Date().toISOString(),
          status: 'active', // Ativar o agente quando conectar o WhatsApp
          configuration: {
            connection_status: 'connected',
            evolution_api_key: null,
            evolution_instance_name: profileName,
            last_connection_check: new Date().toISOString()
          }
        })
        .eq('id', agentId)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar perfil WhatsApp:', error)
        throw error
      }

      console.log('✅ Perfil WhatsApp atualizado com sucesso:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  return {
    agents: agentsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    error: agentsQuery.error,
    createAgent: createAgentMutation.mutate,
    updateAgent: updateAgentMutation.mutate,
    deleteAgent: deleteAgentMutation.mutate,
    updateAgentMetrics: updateAgentMetricsMutation.mutate,
    updateAgentWhatsAppProfile: updateAgentWhatsAppProfile.mutate,
    isCreating: createAgentMutation.isPending,
    isUpdating: updateAgentMutation.isPending,
    isDeleting: deleteAgentMutation.isPending,
  }
}
