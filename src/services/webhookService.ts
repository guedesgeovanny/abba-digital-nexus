
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
    
    const response = await fetch(`https://webhook.abbadigital.com.br/webhook/dados-da-instancia/${instanceName}`, {
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

    // Validar se todos os campos obrigatórios estão preenchidos
    const { profilename, contato, fotodoperfil } = data
    
    if (!profilename || !contato || !fotodoperfil) {
      console.log('⚠️ Dados do perfil incompletos, continuando polling...')
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
