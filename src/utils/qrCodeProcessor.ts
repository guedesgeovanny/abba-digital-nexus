
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
  // Usar APENAS o campo "Nome da instância" da resposta
  const instanceName = response["Nome da instância"]
  
  console.log('=== EXTRAÇÃO DO NOME DA INSTÂNCIA ===')
  console.log('Campo "Nome da instância":', instanceName)
  
  if (!instanceName) {
    console.error('❌ Campo "Nome da instância" não encontrado na resposta!')
    throw new Error('Nome da instância não encontrado na resposta da API')
  }
  
  console.log('✅ Nome da instância extraído:', instanceName)
  return instanceName
}
