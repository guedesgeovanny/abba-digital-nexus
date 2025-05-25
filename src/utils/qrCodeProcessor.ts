
import { WhatsAppResponse, ProfileData } from "@/utils/whatsappUtils"

export const processQRCodeResponse = (response: WhatsAppResponse, originalInstanceName: string) => {
  console.log('=== RESPOSTA COMPLETA DA API ===')
  console.log('Estrutura da resposta:', JSON.stringify(response, null, 2))
  console.log('Campos disponíveis:', Object.keys(response))
  console.log('Instance Name original usado na criação:', originalInstanceName)
  
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
    console.log('✅ Usando instanceName original:', originalInstanceName)

    return {
      qrCodeData: {
        code: response.code,
        base64: processedBase64
      },
      instanceName: originalInstanceName // Usar o nome original, não da resposta
    }
  }
  
  if (response.message) {
    console.log('📝 Mensagem de conexão:', response.message)
    return {
      message: response.message,
      instanceName: originalInstanceName // Usar o nome original sempre
    }
  }
  
  console.error('Resposta inesperada da API:', response)
  throw new Error('A API retornou dados inesperados. Verifique o console.')
}

export const processProfileData = (response: any): ProfileData | null => {
  console.log('=== PROCESSANDO DADOS DO PERFIL ===')
  console.log('Dados recebidos:', response)
  
  const { profilename, contato, fotodoperfil } = response
  
  // Validar se todos os campos obrigatórios estão preenchidos
  if (!profilename || !contato || !fotodoperfil) {
    console.log('⚠️ Dados do perfil incompletos:')
    console.log('profilename:', profilename)
    console.log('contato:', contato)
    console.log('fotodoperfil:', fotodoperfil)
    return null
  }
  
  console.log('✅ Dados do perfil válidos!')
  return {
    profileName: profilename,
    contact: contato,
    profilePictureUrl: fotodoperfil
  }
}
