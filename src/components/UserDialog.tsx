import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit } from 'lucide-react'
import { User } from '@/hooks/useUsers'

interface UserDialogProps {
  user?: User
  onSave: (userData: any) => Promise<boolean>
  trigger?: React.ReactNode
}

export const UserDialog = ({ user, onSave, trigger }: UserDialogProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    password: '',
    role: user?.role || 'viewer' as const,
    status: user?.status || 'active' as const
  })

  const isEditing = !!user

  const handleSave = async () => {
    if (!formData.email || !formData.full_name) {
      return
    }

    if (!isEditing && !formData.password) {
      return
    }

    setLoading(true)
    const success = await onSave(formData)
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
          status: 'active'
        })
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
      <DialogContent className="bg-abba-dark border-abba-gray max-w-md">
        <DialogHeader>
          <DialogTitle className="text-abba-text">
            {isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-abba-text">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isEditing} // Não permitir alterar email ao editar
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
              <SelectContent className="bg-abba-dark border-abba-gray">
                <SelectItem value="admin" className="text-abba-text hover:bg-abba-gray">
                  Administrador
                </SelectItem>
                <SelectItem value="editor" className="text-abba-text hover:bg-abba-gray">
                  Editor
                </SelectItem>
                <SelectItem value="viewer" className="text-abba-text hover:bg-abba-gray">
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
              <SelectContent className="bg-abba-dark border-abba-gray">
                <SelectItem value="active" className="text-abba-text hover:bg-abba-gray">
                  Ativo
                </SelectItem>
                <SelectItem value="pending" className="text-abba-text hover:bg-abba-gray">
                  Pendente
                </SelectItem>
                <SelectItem value="inactive" className="text-abba-text hover:bg-abba-gray">
                  Inativo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 border-abba-gray text-abba-text hover:bg-abba-gray/10"
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