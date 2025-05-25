
export const isValidBase64 = (str: string): boolean => {
  try {
    return btoa(atob(str)) === str
  } catch (err) {
    return false
  }
}

export interface QRCodeData {
  code: string
  base64: string
}

export interface WhatsAppResponse {
  instanceId?: string
  "Nome da instância"?: string | any
  code?: string
  base64?: string
  message?: string
  instanceName?: string
  "instance-Name"?: string
  [key: string]: any // Permite campos adicionais
}
