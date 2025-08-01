import React from 'react'
import { Paperclip, Download, Trash2, FileText, Image, Video, Music, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useConversationAttachments, ConversationAttachment } from '@/hooks/useConversationAttachments'
import { Badge } from '@/components/ui/badge'

interface AttachmentsPanelProps {
  conversationId: string | null
  onUploadClick: () => void
}

const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return <Image className="h-4 w-4" />
  if (mimetype.startsWith('video/')) return <Video className="h-4 w-4" />
  if (mimetype.startsWith('audio/')) return <Music className="h-4 w-4" />
  if (mimetype === 'application/pdf' || mimetype.includes('document')) return <FileText className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Tamanho desconhecido'
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({
  conversationId,
  onUploadClick,
}) => {
  const { attachments, isLoading, deleteAttachment, isDeleting } = useConversationAttachments(conversationId)

  const handleDownload = async (attachment: ConversationAttachment) => {
    try {
      const response = await fetch(attachment.media_file.url)
      const blob = await response.blob()
      
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = attachment.media_file.original_filename || attachment.media_file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading file:', error)
      // Fallback: open in new tab
      window.open(attachment.media_file.url, '_blank')
    }
  }

  const handleDelete = (attachmentId: string) => {
    if (confirm('Tem certeza que deseja remover este anexo?')) {
      deleteAttachment(attachmentId)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Paperclip className="h-5 w-5" />
            <span>Anexos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Carregando anexos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Paperclip className="h-5 w-5" />
            <span>Anexos</span>
            {attachments.length > 0 && (
              <Badge variant="secondary">{attachments.length}</Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadClick}
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Anexar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {attachments.length === 0 ? (
          <div className="text-center py-6">
            <Paperclip className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum anexo encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em "Anexar" para adicionar arquivos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div key={attachment.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex items-start space-x-3">
                  <div className="text-muted-foreground mt-1">
                    {getFileIcon(attachment.media_file.mimetype)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {attachment.media_file.original_filename || attachment.media_file.filename}
                      </p>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(attachment)}
                          title="Baixar arquivo"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attachment.id)}
                          disabled={isDeleting}
                          title="Remover anexo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.media_file.size_bytes)}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attachment.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}