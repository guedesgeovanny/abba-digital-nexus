import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface ProfileUpdateData {
  full_name?: string
  avatar_url?: string
}

export const useProfileUpdate = () => {
  const [loading, setLoading] = useState(false)
  const { userProfile } = useAuth()
  const { toast } = useToast()

  const updateProfile = async (data: ProfileUpdateData): Promise<boolean> => {
    if (!userProfile) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado',
        variant: 'destructive'
      })
      return false
    }

    setLoading(true)
    
    try {
      // If avatar_url is a data URL (base64), upload to storage first
      let finalAvatarUrl = data.avatar_url

      if (data.avatar_url && data.avatar_url.startsWith('data:')) {
        finalAvatarUrl = await uploadAvatar(data.avatar_url)
        if (!finalAvatarUrl) {
          throw new Error('Erro ao fazer upload da imagem')
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          avatar_url: finalAvatarUrl
        })
        .eq('id', userProfile.id)

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      // Force a page reload to refresh the auth context
      window.location.reload()

      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (dataUrl: string): Promise<string | null> => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Generate unique filename
      const fileExt = blob.type.split('/')[1] || 'jpg'
      const fileName = `${userProfile?.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Error uploading avatar:', error)
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error processing avatar upload:', error)
      return null
    }
  }

  const changePassword = async (newPassword: string): Promise<boolean> => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error updating password:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao alterar senha',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    updateProfile,
    changePassword,
    loading
  }
}