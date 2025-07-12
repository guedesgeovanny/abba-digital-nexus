import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, Music, Video, Image as ImageIcon, ExternalLink, X, Maximize2 } from "lucide-react"
import { FileInfo, downloadFile } from "@/utils/fileDetection"

interface MediaMessageProps {
  fileInfo: FileInfo
  messageText: string
  isOutgoing: boolean
}

export const MediaMessage = ({ fileInfo, messageText, isOutgoing }: MediaMessageProps) => {
  const [imageError, setImageError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
          <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
            <DialogTrigger asChild>
              <div className="max-w-xs cursor-pointer group relative">
                <img
                  src={fileInfo.url}
                  alt={fileInfo.filename}
                  className="rounded-lg max-h-48 object-cover w-full"
                  onError={() => setImageError(true)}
                  onLoad={() => setImageError(false)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-0 bg-black/90">
              <div className="relative flex items-center justify-center min-h-[50vh]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <X className="h-6 w-6" />
                </Button>
                <img
                  src={fileInfo.url}
                  alt={fileInfo.filename}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            </DialogContent>
          </Dialog>
        )
      
      case 'video':
        return (
          <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
            <DialogTrigger asChild>
              <div className="max-w-xs cursor-pointer group relative">
                <video
                  className="rounded-lg max-h-48 w-full"
                  preload="metadata"
                  muted
                >
                  <source src={fileInfo.url} />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-0 bg-black/90">
              <div className="relative flex items-center justify-center min-h-[50vh]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <X className="h-6 w-6" />
                </Button>
                <video
                  controls
                  className="max-w-full max-h-full"
                  preload="metadata"
                >
                  <source src={fileInfo.url} />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            </DialogContent>
          </Dialog>
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
        
        {(fileInfo.type === 'image' || fileInfo.type === 'video') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="h-8 px-2 text-xs"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Tela Cheia
          </Button>
        )}
        
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