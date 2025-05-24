
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-abba-black flex items-center justify-center">
        <div className="text-abba-text">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
