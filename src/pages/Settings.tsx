
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, Trash2, Lock, AlertCircle, RefreshCw, CheckCircle, Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useUsers } from "@/hooks/useUsers"
import { useAuth } from "@/contexts/AuthContext"
import { UserDialog } from "@/components/UserDialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const Settings = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { toast } = useToast()
  
  // Hook para buscar o perfil do usuário atual
  const { userProfile: currentUserProfile, loading: profileLoading } = useAuth()
  
  // Hook para gerenciar usuários - agora com verificação de admin interna
  const { users, loading, createUser, updateUser, deleteUser, refetch, isAdmin } = useUsers()

  console.log('Current user profile:', currentUserProfile)
  console.log('Is admin:', isAdmin)
  console.log('Users loaded:', users)
  console.log('Users count:', users.length)

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro", 
        description: "As senhas não coincidem",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
        variant: "default"
      })

      // Limpar campos
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar senha. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ''
    const names = name.trim().split(' ')
    const firstInitial = names[0]?.[0] || ''
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : ''
    return (firstInitial + lastInitial).toUpperCase()
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-abba-blue" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'pending':
        return 'Pendente'
      case 'inactive':
        return 'Inativo'
      default:
        return 'Desconhecido'
    }
  }

  // Se ainda está carregando o perfil, mostrar loading
  if (profileLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Carregando perfil...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie sua conta e preferências
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-card border-border">
          <TabsTrigger value="users" className="data-[state=active]:bg-abba-green data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            {isAdmin ? `Usuários (${users.length})` : 'Meu Perfil'}
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-abba-green data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">
                    {isAdmin ? 'Usuários & Permissões' : 'Meu Perfil'}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {isAdmin 
                      ? `Gerencie quem tem acesso à plataforma. ${users.length > 0 ? `${users.length} usuários encontrados` : 'Nenhum usuário encontrado'}`
                      : 'Visualize suas informações de perfil e configurações'
                    }
                  </CardDescription>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetch}
                      disabled={loading}
                      className="border-border text-foreground hover:bg-accent"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                    <UserDialog onSave={createUser} />
                  </div>
                )}
              </div>
            </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex items-center gap-2 text-foreground">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Carregando usuários...
                      </div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4">
                      <AlertCircle className="w-8 h-8 text-muted-foreground" />
                      <div className="text-center">
                        <div className="text-muted-foreground mb-2">Nenhum usuário encontrado</div>
                        <div className="text-sm text-muted-foreground">
                          Clique em "Novo Usuário" para adicionar o primeiro usuário ao sistema.
                        </div>
                      </div>
                      <UserDialog onSave={createUser} />
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent transition-all duration-200 border border-border">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center relative">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.full_name || 'Avatar'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-abba-green rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {user.full_name ? getInitials(user.full_name) : user.email[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{user.full_name || 'Sem nome'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Criado em: {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant="outline" 
                            className="border-abba-green text-abba-green"
                          >
                            {user.role === 'admin' ? 'Admin' : user.role === 'editor' ? 'Editor' : 'Viewer'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(user.status)}
                            <Badge 
                              className={user.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500' : 
                                        user.status === 'pending' ? 'bg-abba-blue/20 text-abba-blue border-abba-blue' : 'bg-red-500/20 text-red-400 border-red-500'}
                              variant="outline"
                            >
                              {getStatusLabel(user.status)}
                            </Badge>
                          </div>
                          
                          {isAdmin && (
                            <>
                              <UserDialog 
                                user={user} 
                                onSave={(userData) => updateUser(user.id, userData)}
                              />
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-abba-dark border-abba-gray">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-abba-text">Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      Tem certeza que deseja excluir o usuário {user.full_name || user.email}? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-abba-gray text-abba-text hover:bg-abba-gray/10">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteUser(user.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Configurações de Segurança</CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-card-foreground">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background border-border text-foreground focus:border-abba-green"
                    placeholder="Digite sua nova senha"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-card-foreground">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background border-border text-foreground focus:border-abba-green"
                    placeholder="Confirme sua nova senha"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="bg-abba-green hover:bg-abba-green-light text-white"
                >
                  {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
