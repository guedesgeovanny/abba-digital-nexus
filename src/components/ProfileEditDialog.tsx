import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, User, Lock, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useProfileUpdate } from '@/hooks/useProfileUpdate'

interface ProfileEditDialogProps {
  trigger?: React.ReactNode
}

export const ProfileEditDialog = ({ trigger }: ProfileEditDialogProps) => {
  const { userProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { updateProfile, changePassword } = useProfileUpdate()
  
  const [formData, setFormData] = useState({
    full_name: userProfile?.full_name || '',
    avatar_url: userProfile?.avatar_url || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [formErrors, setFormErrors] = useState({
    full_name: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const [showPasswordSection, setShowPasswordSection] = useState(false)

  useEffect(() => {
    if (open && userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        avatar_url: userProfile.avatar_url || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setAvatarPreview(userProfile.avatar_url || null)
      setShowPasswordSection(false)
    }
    
    setFormErrors({
      full_name: false,
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    })
  }, [open, userProfile])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione uma imagem válida',
          variant: 'destructive'
        })
        return
      }
      
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
      full_name: !formData.full_name || formData.full_name.trim().length < 2,
      currentPassword: showPasswordSection && !formData.currentPassword,
      newPassword: showPasswordSection && (!formData.newPassword || formData.newPassword.length < 6),
      confirmPassword: showPasswordSection && formData.newPassword !== formData.confirmPassword
    }
    
    setFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Update profile info
      const profileSuccess = await updateProfile({
        full_name: formData.full_name,
        avatar_url: formData.avatar_url
      })

      if (!profileSuccess) {
        throw new Error('Erro ao atualizar perfil')
      }

      // Update password if provided
      if (showPasswordSection && formData.newPassword) {
        const passwordSuccess = await changePassword(formData.newPassword)
        if (!passwordSuccess) {
          toast({
            title: 'Aviso',
            description: 'Perfil atualizado, mas houve erro ao alterar a senha',
            variant: 'destructive'
          })
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
        variant: 'default'
      })
      
      setOpen(false)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
      <Edit className="h-4 w-4" />
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
            Editar Perfil
          </DialogTitle>
        </DialogHeader>
        
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
                      {getInitials(formData.full_name) || (userProfile?.email?.[0]?.toUpperCase() || '?')}
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
            <Label htmlFor="full_name" className="text-foreground">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className={`bg-background border-border text-foreground focus:border-primary ${formErrors.full_name ? 'border-red-500' : ''}`}
              placeholder="Seu nome completo"
            />
            {formErrors.full_name && (
              <p className="text-red-500 text-xs mt-1">Nome deve ter pelo menos 2 caracteres</p>
            )}
          </div>

          <div>
            <Label className="text-foreground">Email</Label>
            <Input
              value={userProfile?.email || ''}
              disabled
              className="bg-muted border-border text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">O email não pode ser alterado</p>
          </div>

          {/* Password Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">Alterar Senha</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-primary hover:bg-primary/10"
              >
                <Lock className="w-4 h-4 mr-2" />
                {showPasswordSection ? 'Cancelar' : 'Alterar Senha'}
              </Button>
            </div>

            {showPasswordSection && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="newPassword" className="text-foreground">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`bg-background border-border text-foreground focus:border-primary ${formErrors.newPassword ? 'border-red-500' : ''}`}
                    placeholder="Digite sua nova senha"
                  />
                  {formErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">A senha deve ter pelo menos 6 caracteres</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`bg-background border-border text-foreground focus:border-primary ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirme sua nova senha"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">As senhas não coincidem</p>
                  )}
                </div>
              </div>
            )}
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
              {loading ? 'Salvando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}