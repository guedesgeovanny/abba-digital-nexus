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

  // Função unificada para verificar status de uma conexão e atualizar banco
  const verifyConnectionStatus = async (connectionId: string, instanceName: string, silent = false) => {
    try {
      const response = await Promise.race([
        fetch(`${WEBHOOK_URLS.CHECK_STATUS}?instanceName=${encodeURIComponent(instanceName)}`),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), POLLING_CONFIG.requestTimeout)
        )
      ]) as Response
      
      if (!response.ok) {
        console.warn(`Status check failed for ${instanceName}:`, response.status)
        return false
      }
      
      const data = await response.json()
      console.log(`[verifyConnectionStatus] Raw data for ${instanceName}:`, data)
      
      // Detectar conexão usando a mesma lógica do QrPolling
      let isConnected = false
      let profileData: any = null
      
      // Verificar se é a nova estrutura com array/instance
      const parsedData = Array.isArray(data) ? data[0] : data
      const target = parsedData.instance || parsedData
      
      if (target && target.status && target.status.toLowerCase() === 'open') {
        isConnected = true
        profileData = {
          profileName: target.profileName && target.profileName !== "not loaded"
            ? target.profileName
            : "Usuário WhatsApp",
          contact: target.owner || "",
          profilePictureUrl: target.profilePictureUrl || "",
          connectedAt: new Date().toISOString()
        }
      } else {
        // Fallback para estrutura antiga
        isConnected = data.connected === true || 
                     (typeof data.status === 'string' && 
                      ['open', 'connected', 'ready', 'active'].includes(data.status.toLowerCase()))
        
        if (isConnected) {
          profileData = {
            profileName: data.profileName === "not loaded" ? "Usuário WhatsApp" : (data.profileName || "Usuário WhatsApp"),
            contact: data.contato || "",
            profilePictureUrl: data.fotodoperfil || "",
            connectedAt: new Date().toISOString()
          }
        }
      }
      
      const newStatus = isConnected ? 'connected' : 'disconnected'
      
      // Atualizar banco com dados unificados
      const updateData: any = { status: newStatus }
      
      if (isConnected && profileData) {
        updateData.whatsapp_profile_name = profileData.profileName || null
        updateData.whatsapp_contact = profileData.contact || null
        updateData.whatsapp_profile_picture_url = profileData.profilePictureUrl || null
        updateData.whatsapp_connected_at = profileData.connectedAt
      } else if (!isConnected) {
        updateData.whatsapp_profile_name = null
        updateData.whatsapp_contact = null
        updateData.whatsapp_profile_picture_url = null
        updateData.whatsapp_connected_at = null
      }
      
      await supabase
        .from('conexoes')
        .update(updateData)
        .eq('id', connectionId)
      
      if (!silent) {
        console.log(`[verifyConnectionStatus] Updated ${instanceName} status to ${newStatus}`)
      }
      
      return { statusChanged: true, newStatus, profileData }
      
    } catch (error) {
      console.error(`Error verifying connection ${instanceName}:`, error)
      return false
    }
  }

  const verifyAllConnections = async () => {
    setVerifying(true)
    let updatedCount = 0
    
    try {
      await Promise.allSettled(
        connections.map(async (connection) => {
          const result = await verifyConnectionStatus(connection.id, connection.name, true)
          if (result && result.statusChanged) {
            updatedCount++
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
    // Usar a função unificada de verificação ao invés de atualizar diretamente
    if (newStatus === 'connected') {
      const connection = connections.find(c => c.id === id)
      if (connection) {
        await verifyConnectionStatus(id, connection.name)
        await fetchConnections()
        
        toast({
          title: "Sucesso",
          description: "WhatsApp conectado com sucesso!"
        })
      }
    } else if (newStatus === 'connecting') {
      // Quando for 'connecting', apenas atualizar em memória
      setConnections(prev => prev.map(c => c.id === id ? { ...c, status: 'connecting' } : c))
    } else {
      // Para desconexão, manter lógica direta
      try {
        const { error } = await supabase
          .from('conexoes')
          .update({
            status: 'disconnected',
            whatsapp_profile_name: null,
            whatsapp_contact: null,
            whatsapp_profile_picture_url: null,
            whatsapp_connected_at: null
          })
          .eq('id', id)

        if (error) {
          console.error('[handleStatusChange] Error updating connection:', error)
          toast({
            title: "Erro",
            description: "Não foi possível atualizar a conexão.",
            variant: "destructive"
          })
          return
        }
        
        await fetchConnections()
        
        toast({
          title: "Sucesso",
          description: "WhatsApp desconectado."
        })
      } catch (error) {
        console.error('[handleStatusChange] Error:', error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro inesperado.",
          variant: "destructive"
        })
      }
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