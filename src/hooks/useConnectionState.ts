
import { useState } from "react"
import { QRCodeData, ProfileData } from "@/utils/whatsappUtils"

export const useConnectionState = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null)
  const [connectionResult, setConnectionResult] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [instanceName, setInstanceName] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const resetState = () => {
    setConnectionResult(null)
    setQrCodeData(null)
    setImageError(false)
    setInstanceName(null)
    setProfileData(null)
    setIsDeleting(false)
  }

  const handleNewConnection = () => {
    resetState()
  }

  const handleImageError = () => {
    console.error('=== ERRO AO CARREGAR IMAGEM DO QR CODE ===')
    setImageError(true)
  }

  const handleImageLoad = () => {
    console.log('✅ QR Code carregado com sucesso!')
    setImageError(false)
  }

  const retryQrCode = () => {
    console.log('🔄 Tentando recarregar QR Code...')
    setImageError(false)
    const img = document.querySelector('#qr-code-img') as HTMLImageElement
    if (img && qrCodeData) {
      img.src = qrCodeData.base64
    }
  }

  return {
    isConnecting,
    setIsConnecting,
    qrCodeData,
    setQrCodeData,
    connectionResult,
    setConnectionResult,
    imageError,
    setImageError,
    instanceName,
    setInstanceName,
    profileData,
    setProfileData,
    isDeleting,
    setIsDeleting,
    resetState,
    handleNewConnection,
    handleImageError,
    handleImageLoad,
    retryQrCode
  }
}
