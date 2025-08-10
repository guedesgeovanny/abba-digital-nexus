
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
    console.log(`🔍 Verificando status da instância: "${instanceName}"`)
    console.log(`📡 Parâmetro instanceName recebido: "${instanceName}"`)
    console.log(`🔗 URL: https://webhook.abbadigital.com.br/webhook/verifica-status-mp-brasil`)
    console.log(`📦 Body: {"instanceName": "${instanceName}"}`)
    
    const response = await fetch('https://webhook.abbadigital.com.br/webhook/verifica-status-mp-brasil', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName: instanceName
      }),
    })

    console.log(`📡 Status da resposta HTTP: ${response.status}`)

    if (!response.ok) {
      console.log(`⚠️ Resposta não OK para perfil da instância: ${response.status}`)
      return null
    }

    const raw = await response.json()
    console.log('📋 Dados brutos recebidos do polling:', JSON.stringify(raw, null, 2))

    // Normalização do retorno do webhook (suporta ambos formatos)
    // Formato A (atual): [ { instance: { status, owner, profileName, profilePictureUrl, ... } } ]
    // Formato B (antigo): { status, contato, profilename, fotodoperfil }
    let status: string | undefined
    let contato: string | undefined
    let profilename: string | undefined
    let fotodoperfil: string | undefined

    if (Array.isArray(raw) && raw[0]?.instance) {
      const inst = raw[0].instance
      status = inst?.status
      contato = inst?.owner
      profilename = inst?.profileName
      fotodoperfil = inst?.profilePictureUrl
      console.log('🧭 Formato A detectado (array -> instance)')
    } else if (raw?.instance) {
      const inst = raw.instance
      status = inst?.status
      contato = inst?.owner
      profilename = inst?.profileName
      fotodoperfil = inst?.profilePictureUrl
      console.log('🧭 Formato A2 detectado (objeto -> instance)')
    } else if (raw && typeof raw === 'object') {
      // Formato B (antigo)
      status = raw.status
      contato = raw.contato
      profilename = raw.profilename
      fotodoperfil = raw.fotodoperfil
      console.log('🧭 Formato B detectado (objeto plano)')
    } else {
      console.log('⚠️ Resposta não está em formato reconhecido')
      return null
    }

    console.log('🔍 Status da conexão normalizado:', status)
    console.log('📋 Dados normalizados:', { profilename, contato, fotodoperfil, status })

    if (status !== 'open') {
      console.log('⚠️ Status da conexão não é "open", continuando polling...')
      return null
    }

    const hasValidContact = !!(contato && String(contato).trim() !== '')
    const hasValidPhoto = !!(fotodoperfil && String(fotodoperfil).trim() !== '')

    console.log('📋 Validação dos dados essenciais:', {
      hasValidContact,
      hasValidPhoto,
      profilename: profilename || 'não disponível'
    })

    if (!hasValidContact || !hasValidPhoto) {
      console.log('⚠️ Dados essenciais ausentes, continuando polling...')
      return null
    }

    const formattedData = {
      profilename: profilename, // Pode vir "not loaded"; UI decide fallback
      contato: contato,
      fotodoperfil: fotodoperfil,
      status: status
    }

    console.log('✅ Dados do perfil válidos para persistência!')
    console.log('📋 Dados formatados:', formattedData)
    return formattedData

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

// saveProfileToDatabase function removed - use updateAgentWhatsAppProfile from useAgents hook instead

export const checkConnectionStatus = async (instanceName: string): Promise<{ connected: boolean; profileData?: any }> => {
  try {
    console.log(`🔍 Verificando status de conexão para instância: ${instanceName}`)
    // Reutiliza a normalização do getInstanceProfile para evitar duplicação
    const normalized = await getInstanceProfile(instanceName)

    if (!normalized) {
      console.log('⚠️ Sem dados normalizados ou status diferente de "open"')
      return { connected: false }
    }

    const isConnected = normalized.status === 'open'
    return {
      connected: isConnected,
      profileData: isConnected ? normalized : null
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar status:`, error)
    return { connected: false }
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
