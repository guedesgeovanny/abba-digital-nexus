
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { PendingApproval } from './PendingApproval'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se o usuário está pendente de aprovação, mostrar página especial
  if (userProfile?.status === 'pending') {
    return <PendingApproval />
  }

  // Se o usuário está inativo, redirecionar para login
  if (userProfile?.status === 'inactive') {
    return <Navigate to="/login" replace />
  }

  // Se não há perfil ou status não é 'active', bloquear acesso
  if (!userProfile || userProfile.status !== 'active') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
