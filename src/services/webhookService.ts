
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
