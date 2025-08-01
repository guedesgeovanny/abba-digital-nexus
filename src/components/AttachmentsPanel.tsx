import React, { useState } from 'react';
import { Paperclip, Download, Trash2, FileText, Image, Video, Music, File, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useConversationAttachments, ConversationAttachment } from '@/hooks/useConversationAttachments';
import { Badge } from '@/components/ui/badge';
interface AttachmentsPanelProps {
  conversationId: string | null;
  onUploadClick: () => void;
}
const getFileIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (mimetype.startsWith('video/')) return <Video className="h-4 w-4" />;
  if (mimetype.startsWith('audio/')) return <Music className="h-4 w-4" />;
  if (mimetype === 'application/pdf' || mimetype.includes('document')) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};
const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Tamanho desconhecido';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
export const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({
  conversationId,
  onUploadClick
}) => {
  const {
    attachments,
    isLoading,
    deleteAttachment,
    isDeleting
  } = useConversationAttachments(conversationId);
  const [previewFile, setPreviewFile] = useState<ConversationAttachment | null>(null);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState<string | null>(null);
  const handleDownload = async (attachment: ConversationAttachment) => {
    try {
      const response = await fetch(attachment.media_file.url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.media_file.original_filename || attachment.media_file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(attachment.media_file.url, '_blank');
    }
  };
  const handleDelete = (attachmentId: string) => {
    setDeleteAttachmentId(attachmentId);
  };
  const confirmDelete = () => {
    if (deleteAttachmentId) {
      deleteAttachment(deleteAttachmentId);
      setDeleteAttachmentId(null);
    }
  };
  const handlePreview = (attachment: ConversationAttachment) => {
    if (attachment.media_file.mimetype.startsWith('image/')) {
      setPreviewFile(attachment);
    } else {
      handleDownload(attachment);
    }
  };
  const renderFilePreview = (attachment: ConversationAttachment) => {
    if (!attachment.media_file.mimetype.startsWith('image/')) return null;
    return <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
        <img src={attachment.media_file.url} alt={attachment.media_file.original_filename || 'Preview'} className="w-full h-full object-cover" onError={e => {
        e.currentTarget.style.display = 'none';
      }} />
      </div>;
  };
  if (isLoading) {
    return <div className="flex items-center gap-3">
        <Paperclip className="w-4 h-4 text-abba-green" />
        <div>
          <p className="text-sm font-medium text-gray-400">Anexos</p>
          <p className="text-sm text-abba-text">Carregando anexos...</p>
        </div>
      </div>;
  }
  return <div className="flex items-start gap-3">
      <Paperclip className="w-4 h-4 text-abba-green flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-400">
            Anexos {attachments.length > 0 && <span className="text-abba-text">({attachments.length})</span>}
          </p>
          <Button variant="outline" size="sm" onClick={onUploadClick} className="h-6 px-2 text-xs border-abba-green text-abba-green hover:bg-abba-green hover:text-abba-text">
            <Paperclip className="h-3 w-3 mr-1" />
            Anexar
          </Button>
        </div>
        
        {attachments.length === 0 ? <p className="text-sm text-abba-text">Nenhum anexo</p> : <div className="space-y-2">
            {attachments.map(attachment => <div key={attachment.id} className="flex items-center gap-2 p-2 rounded-lg border bg-background/50">
                {renderFilePreview(attachment) || <div className="text-muted-foreground flex-shrink-0">
                    {getFileIcon(attachment.media_file.mimetype)}
                  </div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-abba-text">
                    {attachment.media_file.original_filename || attachment.media_file.filename}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.media_file.size_bytes)}</span>
                    <span>•</span>
                    <span>{formatDate(attachment.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {attachment.media_file.mimetype.startsWith('image/') && <Button variant="ghost" size="sm" onClick={() => setPreviewFile(attachment)} className="h-6 w-6 p-0" title="Visualizar imagem">
                      <Eye className="h-3 w-3" />
                    </Button>}
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(attachment)} className="h-6 w-6 p-0" title="Baixar arquivo">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(attachment.id)} disabled={isDeleting} className="h-6 w-6 p-0" title="Remover anexo">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>)}
          </div>}
      </div>

      {/* Preview Dialog for Images */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{previewFile?.media_file.original_filename || previewFile?.media_file.filename}</span>
              <div className="flex items-center space-x-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => previewFile && handleDownload(previewFile)}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-4 pt-0 overflow-hidden">
            {previewFile && <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
                <img src={previewFile.media_file.url} alt={previewFile.media_file.original_filename || 'Preview'} className="max-w-full max-h-full object-contain" />
              </div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAttachmentId} onOpenChange={() => setDeleteAttachmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este anexo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};