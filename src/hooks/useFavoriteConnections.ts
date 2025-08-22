import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export const useFavoriteConnections = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [favoriteConnections, setFavoriteConnections] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar conexões favoritas do usuário
  useEffect(() => {
    if (!user) return

    const fetchFavoriteConnections = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('user_favorite_connections')
          .select('connection_name')
          .eq('user_id', user.id)

        if (error) {
          console.error('Erro ao carregar conexões favoritas:', error)
          return
        }

        const favorites = data?.map(item => item.connection_name) || []
        setFavoriteConnections(favorites)
      } catch (error) {
        console.error('Erro ao buscar conexões favoritas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavoriteConnections()
  }, [user])

  const toggleFavoriteConnection = async (connectionName: string) => {
    if (!user) return

    try {
      const isFavorite = favoriteConnections.includes(connectionName)

      if (isFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('user_favorite_connections')
          .delete()
          .eq('user_id', user.id)
          .eq('connection_name', connectionName)

        if (error) throw error

        setFavoriteConnections(prev => prev.filter(name => name !== connectionName))
        
        toast({
          title: "Conexão removida dos favoritos",
          description: `"${connectionName}" foi removida dos favoritos.`,
        })
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('user_favorite_connections')
          .insert({
            user_id: user.id,
            connection_name: connectionName
          })

        if (error) throw error

        setFavoriteConnections(prev => [...prev, connectionName])
        
        toast({
          title: "Conexão adicionada aos favoritos",
          description: `"${connectionName}" foi adicionada aos favoritos.`,
        })
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar favorito. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const isFavorite = (connectionName: string) => {
    return favoriteConnections.includes(connectionName)
  }

  return {
    favoriteConnections,
    isLoading,
    toggleFavoriteConnection,
    isFavorite
  }
}