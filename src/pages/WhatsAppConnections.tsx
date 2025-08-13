import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, RotateCw, Smartphone } from "lucide-react"
import { ConnectionNameModal } from "@/components/ConnectionNameModal"
import { InstanceCard } from "@/components/InstanceCard"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { WEBHOOK_URLS, POLLING_CONFIG } from "@/utils/connectionValidation"

interface Connection {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'connecting'
  whatsapp_profile_name?: string
  whatsapp_contact?: string
  whatsapp_profile_picture_url?: string
  whatsapp_connected_at?: string
  created_at: string
}

export default function WhatsAppConnections() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  const fetchConnections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conexoes')
        .select('id, name, status, whatsapp_profile_name, whatsapp_contact, whatsapp_profile_picture_url, whatsapp_connected_at, created_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform data to match our interface
      const transformedData: Connection[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        status: ['connected', 'disconnected', 'connecting'].includes(item.status) 
          ? item.status as 'connected' | 'disconnected' | 'connecting'
          : 'disconnected',
        whatsapp_profile_name: item.whatsapp_profile_name,
        whatsapp_contact: item.whatsapp_contact,
        whatsapp_profile_picture_url: item.whatsapp_profile_picture_url,
        whatsapp_connected_at: item.whatsapp_connected_at,
        created_at: item.created_at
      }))
      
      setConnections(transformedData)
    } catch (error) {
      console.error('Error fetching connections:', error)
      toast({
        title: "Erro ao carregar conexões",
        description: "Não foi possível carregar suas conexões.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const verifyAllConnections = async () => {
    setVerifying(true)
    let updatedCount = 0
    
    try {
      await Promise.allSettled(
        connections.map(async (connection) => {
          try {
            const response = await Promise.race([
              fetch(`${WEBHOOK_URLS.CHECK_STATUS}?instanceName=${encodeURIComponent(connection.name)}`),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), POLLING_CONFIG.requestTimeout)
              )
            ]) as Response
            
            if (!response.ok) return
            
            const data = await response.json()
            
            const connected = data.connected === true || 
                             (typeof data.status === 'string' && 
                              ['open', 'connected', 'ready', 'active'].includes(data.status.toLowerCase()))
            
            const newStatus = connected ? 'connected' : 'disconnected'
            
            if (connection.status !== newStatus) {
              await supabase
                .from('conexoes')
                .update({
                  status: newStatus,
                  whatsapp_profile_name: data.profilename || null,
                  whatsapp_contact: data.contato || null,
                  whatsapp_profile_picture_url: data.fotodoperfil || null,
                  whatsapp_connected_at: connected ? new Date().toISOString() : null
                })
                .eq('id', connection.id)
              
              updatedCount++
            }
          } catch (error) {
            console.error(`Error verifying connection ${connection.name}:`, error)
          }
        })
      )
      
      await fetchConnections()
      
      toast({
        title: "Verificação concluída",
        description: `${updatedCount} conexão(ões) atualizadas.`
      })
    } catch (error) {
      console.error('Error verifying connections:', error)
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar todas as conexões.",
        variant: "destructive"
      })
    } finally {
      setVerifying(false)
    }
  }

  const createConnection = async (name: string) => {
    try {
      setCreating(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // First create instance via webhook
      const webhookResponse = await fetch(WEBHOOK_URLS.CREATE_INSTANCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, instanceName: name })
      })

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`)
      }

      const webhookData = await webhookResponse.json()
      const instanceId = webhookData.instanceId

      // Insert connection in database
      const { data, error } = await supabase
        .from('conexoes')
        .insert({
          user_id: user.id,
          name,
          type: 'whatsapp',
          channel: 'whatsapp',
          status: 'disconnected',
          configuration: {
            connection_status: 'disconnected',
            evolution_api_key: null,
            evolution_instance_name: instanceId
          }
        })
        .select()
        .single()
      
      if (error) throw error
      
      await fetchConnections()
      setShowNameModal(false)
      
      toast({
        title: "Conexão criada!",
        description: `A conexão "${name}" foi criada com sucesso.`
      })
    } catch (error: any) {
      console.error('Error creating connection:', error)
      
      if (error.code === '23505') {
        toast({
          title: "Nome já existe",
          description: "Uma conexão com este nome já existe. Escolha outro nome.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Erro ao criar conexão",
          description: "Não foi possível criar a conexão. Tente novamente.",
          variant: "destructive"
        })
      }
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (
    id: string, 
    newStatus: 'connected' | 'disconnected' | 'connecting', 
    profileData?: any
  ) => {
    try {
      // Quando for 'connecting', não tocar no banco nem refazer o fetch; apenas atualizar em memória
      if (newStatus === 'connecting') {
        setConnections(prev => prev.map(c => c.id === id ? { ...c, status: 'connecting' } : c))
        return
      }

      const updateData: any = { status: newStatus }
      
      if (newStatus === 'connected' && profileData) {
        updateData.whatsapp_profile_name = profileData.profileName || null
        updateData.whatsapp_contact = profileData.contato || profileData.phone || null
        updateData.whatsapp_profile_picture_url = profileData.profilePictureUrl || null
        updateData.whatsapp_connected_at = new Date().toISOString()
      } else if (newStatus === 'disconnected') {
        updateData.whatsapp_connected_at = null
      }
      
      const { error } = await supabase
        .from('conexoes')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      await fetchConnections()
    } catch (error) {
      console.error('Error updating connection status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da conexão.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conexoes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await fetchConnections()
    } catch (error) {
      console.error('Error deleting connection:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a conexão do banco de dados.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conexões WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie suas conexões com o WhatsApp
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={verifyAllConnections}
            disabled={verifying || connections.length === 0}
            className="w-full sm:w-auto"
          >
            <RotateCw className={`mr-2 h-4 w-4 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? "Verificando..." : "Verificar Agora"}
          </Button>
          
          <Button 
            onClick={() => setShowNameModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conexão
          </Button>
        </div>
      </div>

      {/* Connections Grid */}
      {connections.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Smartphone className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma conexão ainda</h3>
          <p className="text-muted-foreground mb-4">
            Crie sua primeira conexão WhatsApp para começar
          </p>
          <Button onClick={() => setShowNameModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeira Conexão
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <InstanceCard
              key={connection.id}
              id={connection.id}
              name={connection.name}
              status={connection.status}
              profileName={connection.whatsapp_profile_name}
              contact={connection.whatsapp_contact}
              profilePictureUrl={connection.whatsapp_profile_picture_url}
              connectedAt={connection.whatsapp_connected_at}
              createdAt={connection.created_at}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ConnectionNameModal
        open={showNameModal}
        onOpenChange={setShowNameModal}
        onConfirm={createConnection}
        isLoading={creating}
      />
    </div>
  )
}