import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { ContactWithTags } from './useContacts'

export const useContactDetails = (contactId: string | null) => {
  return useQuery({
    queryKey: ['contact-details', contactId],
    queryFn: async () => {
      if (!contactId) return null
      
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_tag_relations (
            contact_tags (
              id,
              user_id,
              name,
              color,
              created_at
            )
          ),
          agents!contacts_agent_assigned_fkey (
            id,
            name,
            status
          )
        `)
        .eq('id', contactId)
        .single()

      if (error) throw error

      // Transform the data to include tags and agent properly
      return {
        ...data,
        tags: data.contact_tag_relations?.map(rel => rel.contact_tags).filter(Boolean) || [],
        agent: data.agents || undefined
      } as ContactWithTags
    },
    enabled: !!contactId,
  })
}