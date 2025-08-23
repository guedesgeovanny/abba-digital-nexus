import React from 'react'
import { FileText, Download, Image, Video, Music, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AttachmentMessageProps {
  fileUrl: string
  fileName: string
  fileType?: string
  fileSize?: number
  messageText?: string
  isOutgoing: boolean
}

export const AttachmentMessage: React.FC<AttachmentMessageProps> = ({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  messageText,
  isOutgoing
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
  }

  const getFileIcon = (type?: string) => {
    if (!type) return <FileText className="w-5 h-5" />
    
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return <Archive className="w-5 h-5" />
    
    return <FileText className="w-5 h-5" />
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isImage = fileType?.startsWith('image/')

  return (
    <div className="space-y-2">
      {messageText && (
        <p className="text-sm">{messageText}</p>
      )}
      
      <div className={`
        border border-border rounded-lg p-3 max-w-sm
        ${isOutgoing ? 'bg-abba-green/10' : 'bg-muted/50'}
      `}>
        {isImage ? (
          <div className="space-y-2">
            <img 
              src={fileUrl} 
              alt={fileName}
              className="rounded-md max-w-full h-auto max-h-40 object-contain cursor-pointer"
              onClick={() => window.open(fileUrl, '_blank')}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate flex-1">{fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2"
                onClick={handleDownload}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              {getFileIcon(fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              {fileSize && (
                <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}