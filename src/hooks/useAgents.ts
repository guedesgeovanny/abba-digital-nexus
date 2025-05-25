
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

  return {
    agents: agentsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    error: agentsQuery.error,
    createAgent: createAgentMutation.mutate,
    updateAgent: updateAgentMutation.mutate,
    deleteAgent: deleteAgentMutation.mutate,
    updateAgentMetrics: updateAgentMetricsMutation.mutate,
    isCreating: createAgentMutation.isPending,
    isUpdating: updateAgentMutation.isPending,
    isDeleting: deleteAgentMutation.isPending,
  }
}
