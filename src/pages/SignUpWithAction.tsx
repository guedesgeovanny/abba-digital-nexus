
import { useState } from 'react'
import { signup } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

const SignUpWithAction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await signup(formData)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.success,
        })
        navigate('/login')
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-abba-black flex items-center justify-center p-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-abba-green/5 via-transparent to-abba-green/5" />
      
      {/* Watermark */}
      <div className="absolute bottom-8 right-8 opacity-10">
        <img 
          src="/lovable-uploads/a7cf582e-5718-4f64-912a-e05c747864bf.png" 
          alt="Abba Digital" 
          className="w-24 h-24"
        />
      </div>

      <Card className="w-full max-w-md bg-abba-black border-abba-gray relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/a7cf582e-5718-4f64-912a-e05c747864bf.png" 
              alt="Abba Digital" 
              className="w-16 h-16"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-abba-text">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-gray-400">
            Crie sua conta para acessar o Abba Digital Manager
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-abba-text">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-abba-text">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-abba-text">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Sua senha (mín. 6 caracteres)"
                  className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-abba-gradient hover:opacity-90 text-abba-black font-semibold py-2"
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-abba-green hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUpWithAction
