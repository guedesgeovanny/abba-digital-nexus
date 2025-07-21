
// Utility functions for detecting and handling common links in messages

export interface LinkInfo {
  url: string
  text: string
  type: 'discord' | 'youtube' | 'twitter' | 'instagram' | 'generic'
}

export const detectLinksInMessage = (message: string): LinkInfo[] => {
  // Regex para URLs comuns (exclui URLs com extensões de arquivo)
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const matches = message.match(urlRegex)
  
  if (!matches) return []
  
  return matches
    .filter(url => {
      // Excluir URLs que são arquivos (já tratadas pelo fileDetection)
      const fileExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|mp4|avi|mov|wmv|flv|webm|mkv|mp3|wav|ogg|aac|flac|m4a|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)(\?|$|#)/i
      return !fileExtensions.test(url)
    })
    .map(url => {
      let type: LinkInfo['type'] = 'generic'
      
      if (url.includes('discord.gg') || url.includes('discord.com')) {
        type = 'discord'
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'youtube'
      } else if (url.includes('twitter.com') || url.includes('x.com')) {
        type = 'twitter'
      } else if (url.includes('instagram.com')) {
        type = 'instagram'
      }
      
      // Texto amigável do link
      const text = url.length > 50 ? url.substring(0, 47) + '...' : url
      
      return {
        url,
        text,
        type
      }
    })
}

export const getLinkIcon = (type: LinkInfo['type']): string => {
  switch (type) {
    case 'discord':
      return '💬'
    case 'youtube':
      return '📺'
    case 'twitter':
      return '🐦'
    case 'instagram':
      return '📷'
    default:
      return '🔗'
  }
}
