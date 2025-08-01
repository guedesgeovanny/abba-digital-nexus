
import { useState } from 'react'
import { updateProfile } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const ProfileSettings = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateProfile(formData)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.success,
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Configurações do Perfil</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      <Card className="bg-abba-black border-abba-gray">
        <CardHeader>
          <CardTitle className="text-abba-text">Informações Pessoais</CardTitle>
          <CardDescription className="text-gray-400">
            Atualize suas informações de perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-abba-text">Nome Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={user?.user_metadata?.full_name || ''}
                className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-abba-text">URL do Avatar</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                placeholder="https://exemplo.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-abba-text">Função</Label>
              <Select name="role" defaultValue="viewer">
                <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent className="bg-abba-gray border-abba-gray">
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-abba-text">Status</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent className="bg-abba-gray border-abba-gray">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="bg-abba-gradient hover:opacity-90 text-abba-black font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Atualizando..." : "Atualizar Perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileSettings
