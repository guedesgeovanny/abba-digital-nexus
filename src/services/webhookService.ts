
export const sendInstanceData = async (instanceName: string): Promise<void> => {
  try {
    console.log(`📤 Enviando dados da instância para webhook: ${instanceName}`)
    
    const response = await fetch('https://webhook.abbadigital.com.br/webhook/dados-da-instancia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: instanceName
      }),
    })

    if (!response.ok) {
      console.error(`❌ Erro ao enviar dados da instância: ${response.status}`)
      return
    }

    console.log('✅ Dados da instância enviados com sucesso')
    
  } catch (error) {
    console.error('❌ Erro ao enviar dados da instância:', error)
  }
}

export const getInstanceProfile = async (instanceName: string): Promise<any | null> => {
  try {
    console.log(`🔍 Buscando dados do perfil da instância: ${instanceName}`)
    
    const response = await fetch(`https://webhook.abbadigital.com.br/webhook/dados-da-instancia?instanceName=${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`⚠️ Resposta não OK para perfil da instância: ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log('📋 Dados recebidos do perfil:', data)

    // Validar se todos os campos obrigatórios estão preenchidos e não vazios
    const { profilename, contato, fotodoperfil } = data
    
    if (!profilename || !contato || !fotodoperfil || 
        profilename.trim() === '' || contato.trim() === '' || fotodoperfil.trim() === '') {
      console.log('⚠️ Dados do perfil incompletos ou vazios, continuando polling...')
      console.log('profilename:', profilename)
      console.log('contato:', contato) 
      console.log('fotodoperfil:', fotodoperfil)
      return null
    }

    console.log('✅ Dados do perfil válidos recebidos!')
    return data
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados do perfil:', error)
    return null
  }
}

export const downloadProfileImage = async (imageUrl: string): Promise<string | null> => {
  try {
    console.log('📸 Baixando imagem do perfil:', imageUrl)
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error('❌ Erro ao baixar imagem:', response.status)
      return null
    }
    
    const blob = await response.blob()
    
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        console.log('✅ Imagem convertida para base64')
        resolve(base64)
      }
      reader.onerror = () => {
        console.error('❌ Erro ao converter imagem para base64')
        resolve(null)
      }
      reader.readAsDataURL(blob)
    })
    
  } catch (error) {
    console.error('❌ Erro ao baixar imagem do perfil:', error)
    return null
  }
}

export const saveProfileToDatabase = async (
  agentId: string, 
  profileData: {
    profileName: string
    contact: string
    profilePictureUrl: string
    profilePictureData: string
  }
): Promise<boolean> => {
  try {
    console.log('💾 Salvando dados do perfil no banco:', agentId)
    
    const { supabase } = await import('@/integrations/supabase/client')
    
    const configuration = {
      connection_status: 'connected',
      profile_name: profileData.profileName,
      contact: profileData.contact,
      profile_picture_url: profileData.profilePictureUrl,
      profile_picture_data: profileData.profilePictureData,
      connected_at: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('agents')
      .update({ 
        configuration,
        status: 'active'
      })
      .eq('id', agentId)
    
    if (error) {
      console.error('❌ Erro ao salvar no banco:', error)
      return false
    }
    
    console.log('✅ Dados do perfil salvos no banco com sucesso')
    return true
    
  } catch (error) {
    console.error('❌ Erro ao salvar dados do perfil:', error)
    return false
  }
}

export const deleteInstanceConnection = async (instanceName: string): Promise<boolean> => {
  try {
    console.log(`🗑️ Deletando conexão da instância: ${instanceName}`)
    
    // Endpoint será fornecido pelo usuário depois
    // const response = await fetch(`ENDPOINT_A_SER_FORNECIDO/${instanceName}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })

    // if (!response.ok) {
    //   console.error(`❌ Erro ao deletar conexão: ${response.status}`)
    //   return false
    // }

    console.log('✅ Conexão deletada com sucesso (simulado)')
    return true
    
  } catch (error) {
    console.error('❌ Erro ao deletar conexão:', error)
    return false
  }
}
