import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, Trash2, Edit, Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useUsers } from "@/hooks/useUsers"
import { UserDialog } from "@/components/UserDialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DebugPanel } from "@/components/DebugPanel"

const Settings = () => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { toast } = useToast()
  
  // Hook para gerenciar usuários
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()

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
  return (
    <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
        <img 
          src="/lovable-uploads/a7cf582e-5718-4f64-912a-e05c747864bf.png" 
          alt="Abba Digital" 
          className="w-16 h-16"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-abba-text">Configurações</h2>
          <p className="text-gray-400">
            Gerencie sua conta e preferências
          </p>
        </div>
      </div>

      {/* Debug Panel - Temporário */}
      <DebugPanel />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-abba-gray border-abba-gray">
          <TabsTrigger value="users" className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-abba-black border-abba-gray">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-abba-text">Usuários & Permissões</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie quem tem acesso à plataforma
                  </CardDescription>
                </div>
                <UserDialog onSave={createUser} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-abba-text">Carregando usuários...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-400">Nenhum usuário encontrado</div>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-abba-gray hover:bg-opacity-50 transition-all duration-200 hover:scale-[1.02] animate-fade-in">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-abba-green rounded-full flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-200">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.full_name || 'Avatar'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-abba-black font-semibold text-sm">
                              {user.full_name ? 
                                (() => {
                                  const names = user.full_name.trim().split(' ');
                                  const firstInitial = names[0]?.[0] || '';
                                  const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] || '' : '';
                                  return (firstInitial + lastInitial).toUpperCase();
                                })() : 
                                user.email[0].toUpperCase()
                              }
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-abba-text">{user.full_name || 'Sem nome'}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="outline" 
                          className="border-abba-green text-abba-green"
                        >
                          {user.role === 'admin' ? 'Admin' : user.role === 'editor' ? 'Editor' : 'Viewer'}
                        </Badge>
                        <Badge 
                          className={user.status === 'active' ? 'bg-abba-green text-abba-black' : 
                                    user.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white'}
                        >
                          {user.status === 'active' ? 'Ativo' : 
                           user.status === 'pending' ? 'Pendente' : 'Inativo'}
                        </Badge>
                        
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-abba-black border-abba-gray">
            <CardHeader>
              <CardTitle className="text-abba-text">Configurações de Segurança</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-abba-text">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                    placeholder="Digite sua nova senha"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-abba-text">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                    placeholder="Confirme sua nova senha"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="bg-abba-gradient hover:opacity-90 text-abba-black"
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
