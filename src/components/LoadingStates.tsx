import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AlertTriangle, Wifi, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SkeletonUserListProps {
  count?: number
}

export const SkeletonUserList = ({ count = 5 }: SkeletonUserListProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

interface SkeletonConversationListProps {
  count?: number
}

export const SkeletonConversationList = ({ count = 8 }: SkeletonConversationListProps) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      ))}
    </div>
  )
}

interface LoadingWithRetryProps {
  message?: string
  onRetry?: () => void
  showRetry?: boolean
}

export const LoadingWithRetry = ({ 
  message = "Carregando dados...", 
  onRetry,
  showRetry = false 
}: LoadingWithRetryProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex items-center space-x-3">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
      {showRetry && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showRetryButton?: boolean
}

export const ErrorState = ({ 
  title = "Erro ao carregar dados",
  message = "Ocorreu um erro inesperado. Tente novamente.",
  onRetry,
  showRetryButton = true
}: ErrorStateProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {showRetryButton && onRetry && (
          <Button variant="outline" onClick={onRetry} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface TimeoutStateProps {
  onRetry?: () => void
  isUsingCache?: boolean
}

export const TimeoutState = ({ onRetry, isUsingCache = false }: TimeoutStateProps) => {
  return (
    <Card className="w-full max-w-md mx-auto border-orange-200 bg-orange-50">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
          <Wifi className="h-8 w-8 text-orange-600" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-orange-900">
            {isUsingCache ? "Conexão lenta" : "Timeout na conexão"}
          </h3>
          <p className="text-sm text-orange-700">
            {isUsingCache 
              ? "Mostrando dados em cache. A conexão está lenta."
              : "A conexão está demorando muito. Tente novamente."}
          </p>
        </div>

        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="mt-4 border-orange-300 text-orange-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar dados
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export const EmptyState = ({
  title = "Nenhum dado encontrado",
  message = "Não há dados para exibir no momento.",
  icon,
  action
}: EmptyStateProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
        {icon && (
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
            {icon}
          </div>
        )}
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  )
}