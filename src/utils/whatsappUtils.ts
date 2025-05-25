
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
  code?: string
  base64?: string
  message?: string
}
