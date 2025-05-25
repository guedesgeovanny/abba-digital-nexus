
import { WhatsAppResponse } from "@/utils/whatsappUtils"

export const processQRCodeResponse = (response: WhatsAppResponse) => {
  console.log('=== RESPOSTA COMPLETA DA API ===')
  console.log('Estrutura da resposta:', JSON.stringify(response, null, 2))
  console.log('Campos disponíveis:', Object.keys(response))
  
  if (response.code && response.base64) {
    // Processar o base64 corretamente
    let processedBase64 = response.base64
    
    // Se já tem o prefixo data:image, usar diretamente
    if (!response.base64.startsWith('data:image/')) {
      // Se não tem o prefixo, adicionar
      processedBase64 = `data:image/png;base64,${response.base64}`
    }
    
    console.log('✅ QR Code recebido com sucesso')
    console.log('Code:', response.code)
    console.log('Base64 prefix:', processedBase64.substring(0, 30))

    return {
      qrCodeData: {
        code: response.code,
        base64: processedBase64
      },
      instanceName: extractInstanceName(response)
    }
  }
  
  if (response.message) {
    console.log('📝 Mensagem de conexão:', response.message)
    return {
      message: response.message,
      instanceName: extractInstanceName(response)
    }
  }
  
  console.error('Resposta inesperada da API:', response)
  throw new Error('A API retornou dados inesperados. Verifique o console.')
}

const extractInstanceName = (response: WhatsAppResponse): string => {
  console.log('=== EXTRAÇÃO DO NOME DA INSTÂNCIA ===')
  console.log('Campos disponíveis na resposta:', Object.keys(response))
  console.log('Valor do campo "Nome da instância":', response["Nome da instância"])
  console.log('Tipo do valor:', typeof response["Nome da instância"])
  
  // Tentar diferentes formas de extrair o nome da instância
  let instanceName: string | undefined
  
  // Primeira tentativa: campo "Nome da instância"
  if (response["Nome da instância"] && typeof response["Nome da instância"] === 'string') {
    instanceName = response["Nome da instância"]
    console.log('✅ Nome extraído do campo "Nome da instância":', instanceName)
  }
  // Segunda tentativa: campo instanceName
  else if (response.instanceName && typeof response.instanceName === 'string') {
    instanceName = response.instanceName
    console.log('✅ Nome extraído do campo "instanceName":', instanceName)
  }
  // Terceira tentativa: usar instanceId como fallback
  else if (response.instanceId && typeof response.instanceId === 'string') {
    instanceName = response.instanceId
    console.log('⚠️ Usando instanceId como nome da instância:', instanceName)
  }
  
  if (!instanceName) {
    console.error('❌ Não foi possível extrair o nome da instância!')
    console.error('Resposta completa:', JSON.stringify(response, null, 2))
    throw new Error('Nome da instância não encontrado na resposta da API')
  }
  
  console.log('✅ Nome da instância final:', instanceName)
  return instanceName
}
