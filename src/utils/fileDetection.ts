// Utility functions for detecting and handling file links in messages

export interface FileInfo {
  url: string
  type: 'image' | 'video' | 'audio' | 'document'
  extension: string
  filename: string
}

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']

export const detectFileInMessage = (message: string): FileInfo | null => {
  // Regex to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const match = message.match(urlRegex)
  
  if (!match) return null
  
  const url = match[0]
  
  // Extract extension from URL
  const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$|#)/)
  if (!extensionMatch) return null
  
  const extension = extensionMatch[1].toLowerCase()
  
  // Determine file type
  let type: FileInfo['type']
  if (imageExtensions.includes(extension)) {
    type = 'image'
  } else if (videoExtensions.includes(extension)) {
    type = 'video'
  } else if (audioExtensions.includes(extension)) {
    type = 'audio'
  } else if (documentExtensions.includes(extension)) {
    type = 'document'
  } else {
    return null // Unsupported file type
  }
  
  // Extract filename from URL
  const urlParts = url.split('/')
  const filename = urlParts[urlParts.length - 1].split('?')[0] || `file.${extension}`
  
  return {
    url,
    type,
    extension,
    filename
  }
}

export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
    // Fallback: open in new tab
    window.open(url, '_blank')
  }
}