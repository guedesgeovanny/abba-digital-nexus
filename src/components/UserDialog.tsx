import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Upload, X } from 'lucide-react'
import { User } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface UserDialogProps {
  user?: User
  onSave: (userData: any) => Promise<boolean>
  trigger?: React.ReactNode
}

export const UserDialog = ({ user, onSave, trigger }: UserDialogProps) => {
  const { userProfile: currentUserProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    password: '',
    role: (user?.role || 'viewer') as 'admin' | 'editor' | 'viewer',
    status: (user?.status || 'active') as 'active' | 'pending' | 'inactive',
    avatar_url: user?.avatar_url || ''
  })

  const [formErrors, setFormErrors] = useState({
    email: false,
    full_name: false,
    password: false
  })

  const isEditing = !!user

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      if (!isEditing) {
        setFormData({
          email: '',
          full_name: '',
          password: '',
          role: 'viewer',
          status: 'active',
          avatar_url: ''
        })
        setAvatarPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setFormData({
          email: user?.email || '',
          full_name: user?.full_name || '',
          password: '',
          role: (user?.role || 'viewer') as 'admin' | 'editor' | 'viewer',
          status: (user?.status || 'active') as 'active' | 'pending' | 'inactive',
          avatar_url: user?.avatar_url || ''
        })
        setAvatarPreview(user?.avatar_url || null)
      }
      
      // Reset form errors
      setFormErrors({
        email: false,
        full_name: false,
        password: false
      })
    }
  }, [open, user, isEditing])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione uma imagem válida',
          variant: 'destructive'
        })
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive'
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setFormData(prev => ({ ...prev, avatar_url: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setAvatarPreview(null)
    setFormData(prev => ({ ...prev, avatar_url: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ''
    const names = name.trim().split(' ')
    const firstInitial = names[0]?.[0] || ''
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : ''
    return (firstInitial + lastInitial).toUpperCase()
  }

  const validateForm = () => {
    const errors = {
      email: !formData.email || !/\S+@\S+\.\S+/.test(formData.email),
      full_name: !formData.full_name || formData.full_name.trim().length < 2,
      password: !isEditing && (!formData.password || formData.password.length < 6)
    }
    
    setFormErrors(errors)
    
    return !Object.values(errors).some(Boolean)
  }

  const handleSave = async () => {
    console.log("Iniciando salvamento de usuário:", formData)
    
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors)
      return
    }

    setLoading(true)
    
    try {
      // Filtrar campos para edição - remover password ao editar
      const userData = isEditing 
        ? {
            full_name: formData.full_name,
            role: formData.role,
            status: formData.status,
            avatar_url: formData.avatar_url
          }
        : formData
      
      console.log("Enviando dados para criação/edição:", userData)
      
      const success = await onSave(userData)
      
      if (success) {
        console.log("Usuário salvo com sucesso, fechando diálogo")
        setOpen(false)
        // Limpar formulário ao criar apenas
        if (!isEditing) {
          setFormData({
            email: '',
            full_name: '',
            password: '',
            role: 'viewer',
            status: 'active',
            avatar_url: ''
          })
          setAvatarPreview(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      } else {
        console.log("Falha ao salvar usuário")
      }
    } catch (error) {
      console.error("Erro durante o salvamento:", error)
      toast({
        title: 'Erro',
        description: 'Falha ao processar solicitação',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = isEditing ? (
    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
      <Edit className="h-4 w-4" />
    </Button>
  ) : (
    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
      <Plus className="mr-2 h-4 w-4" />
      Adicionar Usuário
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md z-50">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Informações do usuário logado */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">
              {currentUserProfile?.full_name?.split(' ')[0]?.[0] || currentUserProfile?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-medium text-sm">
              {currentUserProfile?.full_name?.split(' ')[0] || currentUserProfile?.email?.split('@')[0] || 'Usuário'}
            </span>
            <span className="text-muted-foreground text-xs">
              {currentUserProfile?.email}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center relative">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-lg">
                      {getInitials(formData.full_name) || (formData.email?.[0]?.toUpperCase() || '?')}
                    </span>
                  </div>
                )}
              </div>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-border text-foreground hover:bg-muted"
              >
                <Upload className="w-4 h-4 mr-2" />
                {avatarPreview ? 'Alterar Foto' : 'Adicionar Foto'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isEditing}
              className={`bg-background border-border text-foreground focus:border-primary ${formErrors.email ? 'border-red-500' : ''}`}
              placeholder="usuario@email.com"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">Email inválido</p>
            )}
          </div>

          <div>
            <Label htmlFor="full_name" className="text-foreground">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className={`bg-background border-border text-foreground focus:border-primary ${formErrors.full_name ? 'border-red-500' : ''}`}
              placeholder="Nome do usuário"
            />
            {formErrors.full_name && (
              <p className="text-red-500 text-xs mt-1">Nome inválido</p>
            )}
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`bg-background border-border text-foreground focus:border-primary ${formErrors.password ? 'border-red-500' : ''}`}
                placeholder="Senha do usuário"
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">A senha deve ter pelo menos 6 caracteres</p>
              )}
            </div>
          )}

          <div>
            <Label className="text-foreground">Função</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: 'admin' | 'editor' | 'viewer') => 
                setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="admin" className="text-foreground hover:bg-muted focus:bg-muted">
                  Administrador
                </SelectItem>
                <SelectItem value="editor" className="text-foreground hover:bg-muted focus:bg-muted">
                  Editor
                </SelectItem>
                <SelectItem value="viewer" className="text-foreground hover:bg-muted focus:bg-muted">
                  Visualizador
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'active' | 'pending' | 'inactive') => 
                setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-background border-border text-foreground focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="active" className="text-foreground hover:bg-muted focus:bg-muted">
                  Ativo
                </SelectItem>
                <SelectItem value="pending" className="text-foreground hover:bg-muted focus:bg-muted">
                  Pendente
                </SelectItem>
                <SelectItem value="inactive" className="text-foreground hover:bg-muted focus:bg-muted">
                  Inativo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
