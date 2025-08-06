
import { useState, useEffect, useCallback } from 'react'
import { getInstanceProfile, downloadProfileImage } from '@/services/webhookService'
import { ProfileData } from '@/utils/whatsappUtils'
import { useAgents } from '@/hooks/useAgents'

interface UseProfilePollingProps {
  instanceName: string | null
  agentId?: string | null
  isActive: boolean
  onProfileReceived: (profileData: ProfileData & { profilePictureData?: string }) => void
}

export const useProfilePolling = ({ 
  instanceName, 
  agentId,
  isActive, 
  onProfileReceived 
}: UseProfilePollingProps) => {
  const [isPolling, setIsPolling] = useState(false)
  const { updateAgentWhatsAppProfile } = useAgents()

  const pollProfile = useCallback(async () => {
    if (!instanceName || !isActive) return

    try {
      console.log(`🔄 Fazendo polling para instância: ${instanceName}`)
      const profileData = await getInstanceProfile(instanceName)
      
      console.log('📋 Dados recebidos do polling:', profileData)
      
      // Validação melhorada: aceitar "not loaded" como profilename válido
      const hasValidContact = profileData?.contato && profileData.contato.trim() !== ''
      const hasValidPhoto = profileData?.fotodoperfil && profileData.fotodoperfil.trim() !== ''
      const hasValidProfileName = profileData?.profilename && 
        profileData.profilename.trim() !== '' && 
        profileData.profilename !== 'not loaded'
      const isProfileNameNotLoaded = profileData?.profilename === 'not loaded'
      
      // Aceitar se temos dados básicos (contato + foto) mesmo se profilename for "not loaded"
      if (profileData && hasValidContact && hasValidPhoto && (hasValidProfileName || isProfileNameNotLoaded)) {
        
        console.log('✅ Dados do perfil válidos recebidos via polling!')
        console.log('📋 Dados validados:', {
          profilename: profileData.profilename,
          contato: profileData.contato,
          fotodoperfil: profileData.fotodoperfil
        })
        
        // Baixar a imagem do perfil
        const profilePictureData = await downloadProfileImage(profileData.fotodoperfil)
        
        if (!profilePictureData) {
          console.error('❌ Falha ao baixar imagem do perfil')
          return
        }
        
        // Usar o número do contato como fallback se profilename for "not loaded"
        const displayName = profileData.profilename === 'not loaded' 
          ? profileData.contato 
          : profileData.profilename
        
        const formattedProfileData: ProfileData & { profilePictureData: string } = {
          profileName: displayName,
          contact: profileData.contato,
          profilePictureUrl: profileData.fotodoperfil,
          profilePictureData: profilePictureData
        }
        
        // Salvar no banco se temos um agentId válido
        if (agentId && agentId.trim() !== '') {
          console.log('💾 Iniciando salvamento dos dados do perfil no banco para agente:', agentId)
          console.log('💾 Dados a serem salvos:', {
            profileName: profileData.profilename,
            contact: profileData.contato,
            profilePictureUrl: profileData.fotodoperfil,
            hasProfilePictureData: !!profilePictureData
          })
          
          // Tentativa com retry automático
          let saveAttempts = 0
          const maxAttempts = 3
          
          while (saveAttempts < maxAttempts) {
            try {
              saveAttempts++
              console.log(`💾 Tentativa ${saveAttempts}/${maxAttempts} de salvar no banco`)
              
              await updateAgentWhatsAppProfile({
                agentId,
                profileName: displayName, // Usar o displayName que já trata o fallback
                contact: profileData.contato,
                profilePictureUrl: profileData.fotodoperfil,
                profilePictureData: profilePictureData
              })

              console.log('✅ Dados do perfil WhatsApp salvos no banco com sucesso!')
              break // Saiu do loop se salvou com sucesso
              
            } catch (error) {
              console.error(`❌ Erro na tentativa ${saveAttempts} ao salvar perfil WhatsApp no banco:`, error)
              
              if (saveAttempts === maxAttempts) {
                console.error('❌ Falha definitiva após todas as tentativas de salvamento')
                // Mesmo com erro no salvamento, continuamos o fluxo para não bloquear a UI
              } else {
                // Aguardar 2 segundos antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, 2000))
              }
            }
          }
        } else {
          console.log('⚠️ AgentId inválido ou não disponível para salvamento:', {
            agentId,
            agentIdType: typeof agentId,
            agentIdLength: agentId?.length
          })
        }
        
        setIsPolling(false)
        onProfileReceived(formattedProfileData)
      } else {
        console.log('⏳ Dados ainda não disponíveis ou incompletos, continuando polling...')
        if (profileData) {
          console.log('📋 Dados parciais recebidos:', {
            profilename: profileData.profilename || 'não disponível',
            contato: profileData.contato || 'não disponível',
            fotodoperfil: profileData.fotodoperfil || 'não disponível'
          })
        }
      }
    } catch (error) {
      console.error('❌ Erro no polling do perfil:', error)
    }
  }, [instanceName, agentId, isActive, onProfileReceived, updateAgentWhatsAppProfile])

  useEffect(() => {
    if (!isActive || !instanceName) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)
    console.log(`🔄 Iniciando polling do perfil a cada 3 segundos para: ${instanceName}`)
    console.log('🔍 AgentId para salvar no banco:', {
      agentId,
      agentIdType: typeof agentId,
      agentIdLength: agentId?.length,
      agentIdTrimmed: agentId?.trim(),
      isEmpty: !agentId || agentId.trim() === ''
    })

    // Fazer primeira chamada imediatamente
    pollProfile()

    // Configurar interval para chamadas subsequentes a cada 3 segundos
    const interval = setInterval(pollProfile, 3000)

    return () => {
      console.log('⏹️ Parando polling do perfil')
      setIsPolling(false)
      clearInterval(interval)
    }
  }, [isActive, instanceName, agentId, pollProfile])

  return {
    isPolling
  }
}
