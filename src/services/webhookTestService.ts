
// Serviço para testar o webhook do n8n localmente
export const testN8nWebhook = async (messageData: {
  conversation_id: string
  content: string
  direction?: 'sent' | 'received'
  message_type?: 'text' | 'image' | 'audio' | 'document' | 'file'
  sender_name?: string
  contact_name?: string
  contact_phone?: string
  contact_username?: string
  contact_avatar?: string
}) => {
  try {
    console.log('🧪 Testando webhook do n8n:', messageData)
    
    // Security Fix: Add authentication header for webhook calls
    const response = await fetch('https://vlarijlhllzjqvxdigds.supabase.co/functions/v1/n8n-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${document.cookie.split('supabase-auth-token=')[1]?.split(';')[0] || ''}`,
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('❌ Erro no webhook:', result)
      throw new Error(result.error || 'Erro desconhecido')
    }

    console.log('✅ Webhook executado com sucesso:', result)
    return result
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error)
    throw error
  }
}

// Função para testar com dados de exemplo
export const testWithSampleData = async (conversationId: string) => {
  return testN8nWebhook({
    conversation_id: conversationId,
    content: 'Mensagem de teste via webhook do n8n',
    direction: 'received',
    message_type: 'text',
    sender_name: 'Cliente Teste',
    contact_name: 'João da Silva',
    contact_phone: '+5511999998888',
    contact_username: 'joao_silva'
  })
}
