
import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Upload, X } from 'lucide-react'
import { User } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'

interface UserDialogProps {
  user?: User
  onSave: (userData: any) => Promise<boolean>
  trigger?: React.ReactNode
}

export const UserDialog = ({ user, onSave, trigger }: UserDialogProps) => {
  const { user: currentUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    password: '',
    role: (user?.role || 'viewer') as 'admin' | 'editor' | 'viewer',
    status: (user?.status || 'active') as 'active' | 'pending' | 'inactive',
    avatar_url: user?.avatar_url || ''
  })

  const isEditing = !!user

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
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

  const handleSave = async () => {
    if (!formData.email || !formData.full_name) {
      return
    }

    if (!isEditing && !formData.password) {
      return
    }

    setLoading(true)
    
    // Filtrar campos para edição - remover password ao editar
    const userData = isEditing 
      ? {
          full_name: formData.full_name,
          role: formData.role,
          status: formData.status,
          avatar_url: formData.avatar_url
        }
      : formData
    
    const success = await onSave(userData)
    setLoading(false)

    if (success) {
      setOpen(false)
      if (!isEditing) {
        // Limpar formulário apenas ao criar
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
    }
  }

  const defaultTrigger = isEditing ? (
    <Button variant="ghost" size="sm" className="text-abba-green hover:bg-abba-green/10">
      <Edit className="h-4 w-4" />
    </Button>
  ) : (
    <Button className="bg-abba-gradient hover:opacity-90 text-abba-black">
      <Plus className="mr-2 h-4 w-4" />
      Adicionar Usuário
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-abba-black border-abba-gray max-w-md z-50">
        <DialogHeader>
          <DialogTitle className="text-abba-text">
            {isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Informações do usuário logado */}
        <div className="flex items-center gap-3 p-3 bg-abba-gray/20 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-abba-green flex items-center justify-center">
            <span className="text-abba-black font-semibold text-sm">
              {currentUser?.user_metadata?.full_name?.split(' ')[0]?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-abba-text font-medium text-sm">
              {currentUser?.user_metadata?.full_name?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'Usuário'}
            </span>
            <span className="text-abba-text/70 text-xs">
              {currentUser?.email}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Avatar Upload - Corrigido */}
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
                  <div className="w-full h-full bg-abba-green rounded-full flex items-center justify-center">
                    <span className="text-abba-black font-semibold text-lg">
                      {getInitials(formData.full_name) || formData.email[0]?.toUpperCase()}
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
                className="border-abba-gray text-abba-text hover:bg-abba-gray/10 hover:text-white"
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
            <Label htmlFor="email" className="text-abba-text">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isEditing}
              className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
              placeholder="usuario@email.com"
            />
          </div>

          <div>
            <Label htmlFor="full_name" className="text-abba-text">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
              placeholder="Nome do usuário"
            />
          </div>

          {!isEditing && (
            <div>
              <Label htmlFor="password" className="text-abba-text">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                placeholder="Senha do usuário"
              />
            </div>
          )}

          <div>
            <Label className="text-abba-text">Função</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: 'admin' | 'editor' | 'viewer') => 
                setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-abba-dark border-abba-gray z-50">
                <SelectItem value="admin" className="text-abba-text hover:bg-abba-gray focus:bg-abba-gray">
                  Administrador
                </SelectItem>
                <SelectItem value="editor" className="text-abba-text hover:bg-abba-gray focus:bg-abba-gray">
                  Editor
                </SelectItem>
                <SelectItem value="viewer" className="text-abba-text hover:bg-abba-gray focus:bg-abba-gray">
                  Visualizador
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-abba-text">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'active' | 'pending' | 'inactive') => 
                setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-abba-dark border-abba-gray z-50">
                <SelectItem value="active" className="text-abba-text hover:bg-abba-gray focus:bg-abba-gray">
                  Ativo
                </SelectItem>
                <SelectItem value="pending" className="text-abba-text hover:bg-abba-gray focus:bg-abba-gray">
                  Pendente
                </SelectItem>
                <SelectItem value="inactive" className="text-abba-text hover:bg-abba-gray focus:bg-abba-gray">
                  Inativo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 border-abba-gray text-abba-text hover:bg-abba-gray/10 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading || !formData.email || !formData.full_name || (!isEditing && !formData.password)}
              className="flex-1 bg-abba-gradient hover:opacity-90 text-abba-black"
            >
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
