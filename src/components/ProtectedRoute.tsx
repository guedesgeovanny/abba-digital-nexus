
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { PendingApproval } from './PendingApproval'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, userProfile, loading, isLoadingProfile } = useAuth()

  console.log('ProtectedRoute: Auth state check:', {
    loading,
    isLoadingProfile,
    user: !!user,
    userProfile,
    status: userProfile?.status
  })

  // Mostrar loading enquanto verifica autenticação ou carrega perfil
  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-abba-black flex items-center justify-center">
        <div className="text-abba-text">Carregando...</div>
      </div>
    )
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Se o usuário está pendente de aprovação, mostrar página especial
  if (userProfile?.status === 'pending') {
    console.log('ProtectedRoute: User pending approval')
    return <PendingApproval />
  }

  // Se o usuário está inativo, redirecionar para login
  if (userProfile?.status === 'inactive') {
    console.log('ProtectedRoute: User inactive, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Se não há perfil ou status não é 'active', redirecionar para login
  if (!userProfile || userProfile.status !== 'active') {
    console.log('ProtectedRoute: No profile or not active, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute: Access granted')
  return <>{children}</>
}
