
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
  let extractedInstanceName: string
  
  if (response["Nome da instância"]) {
    extractedInstanceName = response["Nome da instância"]
    console.log('✅ Nome da instância extraído do campo "Nome da instância":', extractedInstanceName)
  } else if (response.instanceName) {
    extractedInstanceName = response.instanceName
    console.log('✅ Nome da instância extraído do campo "instanceName":', extractedInstanceName)
  } else if (response.instanceId) {
    extractedInstanceName = response.instanceId
    console.log('⚠️ Nome da instância não encontrado, usando instanceId como fallback:', extractedInstanceName)
  } else {
    extractedInstanceName = response.code || 'unknown'
    console.log('⚠️ Nome da instância não encontrado, usando code como fallback:', extractedInstanceName)
  }
  
  console.log('=== DEBUG DOS CAMPOS DE INSTÂNCIA ===')
  console.log('Campo "Nome da instância":', response["Nome da instância"])
  console.log('Campo "instanceName":', response.instanceName)
  console.log('Campo "instanceId":', response.instanceId)
  console.log('Nome final extraído:', extractedInstanceName)
  
  return extractedInstanceName
}
