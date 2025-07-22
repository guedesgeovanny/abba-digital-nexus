
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  
  const { signIn, user, userProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in and profile is loaded
  useEffect(() => {
    if (user && userProfile && userProfile.status === 'active' && !authLoading) {
      navigate("/dashboard")
    }
  }, [user, userProfile, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await signIn(email, password)
    
    if (error) {
      console.error('Login error:', error)
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos",
        variant: "destructive",
      })
      setLoading(false)
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      })
      // O redirecionamento será feito automaticamente pelo useEffect
      // quando o user e userProfile forem carregados
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
            Abba Digital Manager
          </CardTitle>
          <CardDescription className="text-gray-400">
            Entre na sua conta para gerenciar seus agentes digitais
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-abba-text">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-abba-green"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-abba-gradient hover:opacity-90 text-abba-black font-semibold py-2"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-400">
              Não tem uma conta?{" "}
              <Link to="/signup" className="text-abba-green hover:underline">
                Criar conta
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Esqueceu sua senha?{" "}
              <a href="#" className="text-abba-green hover:underline">
                Recuperar senha
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
