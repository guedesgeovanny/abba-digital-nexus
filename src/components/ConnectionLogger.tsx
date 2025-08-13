import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Copy, X, ChevronUp, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'error' | 'success' | 'warning'
  message: string
  data?: any
}

interface ConnectionLoggerProps {
  isVisible: boolean
  onClose: () => void
  instanceName: string
}

export function ConnectionLogger({ isVisible, onClose, instanceName }: ConnectionLoggerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const { toast } = useToast()

  const addLog = (level: LogEntry['level'], message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    }
    setLogs(prev => [...prev, newLog])
  }

  // Expor função addLog globalmente para uso em outros componentes
  useEffect(() => {
    if (isVisible) {
      (window as any).connectionLogger = {
        addLog,
        instanceName
      }
      addLog('info', `🚀 Iniciando monitoramento para instância: ${instanceName}`)
    }
    
    return () => {
      if ((window as any).connectionLogger?.instanceName === instanceName) {
        delete (window as any).connectionLogger
      }
    }
  }, [isVisible, instanceName])

  const clearLogs = () => {
    setLogs([])
    addLog('info', `🗑️ Logs limpos pelo usuário`)
  }

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}` + 
      (log.data ? `\nData: ${JSON.stringify(log.data, null, 2)}` : '')
    ).join('\n')
    
    const fullLog = `
=== LOG DE CONEXÃO WHATSAPP ===
Instância: ${instanceName}
Data/Hora: ${new Date().toLocaleString()}
Total de entradas: ${logs.length}

${logText}

=== FIM DO LOG ===
`
    
    navigator.clipboard.writeText(fullLog).then(() => {
      toast({
        title: "Log copiado!",
        description: "O log foi copiado para a área de transferência"
      })
    })
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'success': return 'default'
      case 'warning': return 'secondary'
      default: return 'outline'
    }
  }

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '❌'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-background border-2 shadow-lg">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Log de Conexão</Badge>
          <span className="text-sm text-muted-foreground">
            {instanceName} • {logs.length} entradas
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            Limpar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyLogs}
            disabled={logs.length === 0}
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <ScrollArea className="h-64 p-3">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aguardando eventos...
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-sm">
                  <span className="text-xs text-muted-foreground min-w-[60px]">
                    {log.timestamp}
                  </span>
                  <Badge variant={getLevelColor(log.level)} className="min-w-fit text-xs">
                    {getLevelIcon(log.level)} {log.level}
                  </Badge>
                  <div className="flex-1">
                    <p className="break-all">{log.message}</p>
                    {log.data && (
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </Card>
  )
}