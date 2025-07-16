
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDebugDatabase } from '@/hooks/useDebugDatabase'

export const DebugPanel = () => {
  const { loading, checkTableStructure, testUserOperations } = useDebugDatabase()

  return (
    <Card className="bg-abba-black border-abba-gray mb-4">
      <CardHeader>
        <CardTitle className="text-abba-text">Debug Database</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button 
            onClick={checkTableStructure}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Verificar Estrutura
          </Button>
          <Button 
            onClick={testUserOperations}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600"
          >
            Testar Operações
          </Button>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Verifique o console do navegador para ver os logs detalhados
        </p>
      </CardContent>
    </Card>
  )
}
