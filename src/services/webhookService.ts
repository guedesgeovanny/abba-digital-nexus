
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

    const data = await response.json()
    console.log('📋 Dados brutos recebidos do polling:', JSON.stringify(data, null, 2))

    // O webhook retorna um objeto direto, não um array (baseado na edge function)
    if (!data || typeof data !== 'object') {
      console.log('⚠️ Resposta não está no formato esperado (objeto)')
      return null
    }

    console.log('📋 Dados do webhook:', data)

    // Extrair campos diretamente do objeto retornado
    const { profilename, contato, fotodoperfil, status } = data
    
    console.log('🔍 Status da conexão:', status)
    console.log('📋 Dados extraídos:', {
      profilename,
      contato,
      fotodoperfil,
      status
    })
    
    // Verificar se a conexão está ativa
    if (status !== 'open') {
      console.log('⚠️ Status da conexão não é "open", continuando polling...')
      return null
    }
    
    // Validar dados essenciais
    const hasValidContact = contato && contato.trim() !== ''
    const hasValidPhoto = fotodoperfil && fotodoperfil.trim() !== ''
    
    console.log('📋 Validação dos dados essenciais:', {
      hasValidContact,
      hasValidPhoto,
      profilename: profilename || 'não disponível'
    })
    
    // Aceitar conexão se tem dados básicos (contato + foto)
    if (!hasValidContact || !hasValidPhoto) {
      console.log('⚠️ Dados essenciais ausentes, continuando polling...')
      return null
    }
    
    // Retornar dados originais sem fallback - deixar lógica de fallback para o frontend
    const formattedData = {
      profilename: profilename, // Manter valor original do webhook, mesmo que seja "not loaded"
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
    console.log(`📡 Parâmetro instanceName no checkConnectionStatus: "${instanceName}"`)
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
    
    if (!response.ok) {
      console.log(`⚠️ Resposta não OK para verificação de status: ${response.status}`)
      return { connected: false }
    }
    
    const data = await response.json()
    console.log('📋 Dados da verificação de status:', data)
    
    const isConnected = data.status === 'open'
    
    return {
      connected: isConnected,
      profileData: isConnected ? data : null
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
