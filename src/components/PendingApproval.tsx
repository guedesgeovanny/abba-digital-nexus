import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Mail, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export const PendingApproval = () => {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Conta Pendente</CardTitle>
            <CardDescription className="text-base mt-2">
              Sua conta foi criada com sucesso!
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Aguardando Aprovação</p>
                <p className="text-muted-foreground">
                  Um administrador precisa aprovar sua conta antes que você possa acessar o sistema.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Próximos Passos</p>
                <p className="text-muted-foreground">
                  Você receberá uma notificação por email assim que sua conta for aprovada.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Dúvidas? Entre em contato com o{" "}
              <span className="text-primary font-medium">administrador</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}