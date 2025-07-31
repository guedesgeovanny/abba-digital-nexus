import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { ContactWithTags } from './useContacts'

export const useContactDetails = (contactId: string | null) => {
  return useQuery({
    queryKey: ['contact-details', contactId],
    queryFn: async () => {
      if (!contactId) return null
      
      // First get the contact with tags
      const { data: contactData, error } = await supabase
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
          )
        `)
        .eq('id', contactId)
        .single()

      if (error) throw error

      // Then get the user profile
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', contactData.user_id)
        .single()

      // Transform the data to include tags and user properly
      return {
        ...contactData,
        tags: contactData.contact_tag_relations?.map(rel => rel.contact_tags).filter(Boolean) || [],
        user: userData || undefined
      } as ContactWithTags
    },
    enabled: !!contactId,
  })
}