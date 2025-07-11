import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText, Music, Video, Image as ImageIcon, ExternalLink } from "lucide-react"
import { FileInfo, downloadFile } from "@/utils/fileDetection"

interface MediaMessageProps {
  fileInfo: FileInfo
  messageText: string
  isOutgoing: boolean
}

export const MediaMessage = ({ fileInfo, messageText, isOutgoing }: MediaMessageProps) => {
  const [imageError, setImageError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadFile(fileInfo.url, fileInfo.filename)
    } catch (error) {
      console.error('Error downloading file:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const getFileIcon = () => {
    switch (fileInfo.type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
    }
  }

  const renderMediaPreview = () => {
    switch (fileInfo.type) {
      case 'image':
        if (imageError) {
          return (
            <div className="flex items-center space-x-2 p-3 border rounded bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm">{fileInfo.filename}</span>
            </div>
          )
        }
        return (
          <div className="max-w-xs">
            <img
              src={fileInfo.url}
              alt={fileInfo.filename}
              className="rounded-lg max-h-48 object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          </div>
        )
      
      case 'video':
        return (
          <div className="max-w-xs">
            <video
              controls
              className="rounded-lg max-h-48 w-full"
              preload="metadata"
            >
              <source src={fileInfo.url} />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        )
      
      case 'audio':
        return (
          <div className="w-full max-w-xs">
            <audio controls className="w-full">
              <source src={fileInfo.url} />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        )
      
      case 'document':
        return (
          <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted max-w-xs">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileInfo.filename}</p>
              <p className="text-xs text-muted-foreground uppercase">{fileInfo.extension}</p>
            </div>
          </div>
        )
    }
  }

  // Check if message is just the URL or has additional text
  const hasAdditionalText = messageText.trim() !== fileInfo.url

  return (
    <div className="space-y-2">
      {/* File preview */}
      {renderMediaPreview()}
      
      {/* Additional text if present */}
      {hasAdditionalText && (
        <p className="text-sm">{messageText.replace(fileInfo.url, '').trim()}</p>
      )}
      
      {/* Action buttons */}
      <div className="flex items-center space-x-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-8 px-2 text-xs"
        >
          {getFileIcon()}
          <Download className="h-3 w-3 ml-1" />
          {isDownloading ? 'Baixando...' : 'Baixar'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(fileInfo.url, '_blank')}
          className="h-8 px-2 text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Abrir
        </Button>
      </div>
    </div>
  )
}