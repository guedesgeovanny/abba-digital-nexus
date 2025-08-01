import React, { useState, useCallback } from 'react';
import { Upload, X, File, FileText, Image, Video, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  isUploading?: boolean;
}
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'video/mp4', 'video/avi', 'video/mov', 'audio/mp3', 'audio/wav', 'audio/ogg', 'text/plain'];
const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />;
  if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />;
  if (file.type.startsWith('audio/')) return <Music className="h-8 w-8" />;
  if (file.type === 'application/pdf' || file.type.includes('document')) return <FileText className="h-8 w-8" />;
  return <File className="h-8 w-8" />;
};
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onOpenChange,
  onUpload,
  isUploading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const validateFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      return 'O arquivo é muito grande. Tamanho máximo: 10MB';
    }
    const fileType = file.type || '';
    const isValidType = ALLOWED_TYPES.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.slice(0, -2));
      }
      return fileType === type;
    });
    if (!isValidType) {
      return 'Tipo de arquivo não permitido';
    }
    return null;
  }, []);
  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setSelectedFile(file);
  }, [validateFile]);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);
  const handleUpload = useCallback(() => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      setError(null);
    }
  }, [selectedFile, onUpload]);
  const handleClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFile(null);
      setError(null);
      onOpenChange(false);
    }
  }, [isUploading, onOpenChange]);
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anexar Arquivo</DialogTitle>
          <DialogDescription>
            Selecione um arquivo para anexar à conversa (máx. 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? <div className={cn("border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors", dragOver && "border-primary bg-primary/5")} onDrop={handleDrop} onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }} onDragLeave={() => setDragOver(false)}>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste um arquivo aqui ou clique para selecionar
              </p>
              <input type="file" accept={ALLOWED_TYPES.join(',')} onChange={handleFileInput} className="hidden" id="file-upload" />
              <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()} className="mt-2">
                Selecionar Arquivo
              </Button>
            </div> : <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="text-muted-foreground">
                {getFileIcon(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} disabled={isUploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>}

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>}

          {isUploading && <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Enviando arquivo...</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading} className="text-slate-50 bg-red-900 hover:bg-red-800">
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="hover:bg-primary hover:text-primary-foreground">
              {isUploading ? 'Enviando...' : 'Anexar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};