import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User, Trash2, Star, Edit2, Check, X } from "lucide-react"
import { Conversation } from "@/hooks/useConversations"
import { useMessages } from "@/hooks/useMessages"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { useUpdateContactName } from "@/hooks/useUpdateContactName"
import { MediaMessage } from "@/components/MediaMessage"
import { detectFileInMessage } from "@/utils/fileDetection"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LinkMessage } from "@/components/LinkMessage"
import { detectLinksInMessage } from "@/utils/linkDetection"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface ChatAreaProps {
  conversation: Conversation
  onDeleteConversation: (conversationId: string) => void
  onUpdateAgentStatus: (conversationId: string, newStatus: 'Ativo' | 'Inativo') => void
}

export const ChatArea = ({ conversation, onDeleteConversation, onUpdateAgentStatus }: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState("")
  const [isUpdatingAgentStatus, setIsUpdatingAgentStatus] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(conversation.contact_name)
  const { messages, isLoading, sendMessage, isSending, clearMessages, isClearing } = useMessages(conversation.id)
  const { toast } = useToast()
  const updateContactName = useUpdateContactName()
  const { user, userProfile } = useAuth()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputBarRef = useRef<HTMLFormElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [selectedConnectionName, setSelectedConnectionName] = useState<string | undefined>(undefined)
  const [defaultConnection, setDefaultConnection] = useState<string | undefined>(undefined)

  // Carregar conexão padrão do localStorage
  useEffect(() => {
    const savedDefaultConnection = localStorage.getItem('defaultConnection')
    if (savedDefaultConnection) {
      setDefaultConnection(savedDefaultConnection)
      setSelectedConnectionName(savedDefaultConnection)
    }
  }, [])

  // Carregar conexões WhatsApp ativas
  useEffect(() => {
    if (!user || !userProfile) return
    
    const fetchConnections = async () => {
      try {
        console.log('🔍 [ChatArea] Fetching connections for user:', user.id, 'role:', userProfile.role)
        
        let query = supabase
          .from('conexoes')
          .select('name, whatsapp_contact, channel, assigned_users, user_id')
          .eq('type', 'whatsapp')
          .eq('status', 'connected')
        
        // Se não for admin, filtrar apenas conexões atribuídas ao usuário
        if (userProfile.role !== 'admin') {
          query = query.or(`assigned_users.cs.["${user.id}"],user_id.eq.${user.id}`)
        }
        
        const { data, error } = await query
        
        if (error) {
          console.error('❌ [ChatArea] Erro ao carregar conexões:', error)
          return
        }
        
        console.log('✅ [ChatArea] Connections loaded:', data)
        setConnections(data || [])
        
        // Se há uma conexão padrão salva, verificar se ainda existe
        const savedDefaultConnection = localStorage.getItem('defaultConnection')
        if (savedDefaultConnection && data?.some(conn => conn.name === savedDefaultConnection)) {
          setSelectedConnectionName(savedDefaultConnection)
        } else if (savedDefaultConnection && !data?.some(conn => conn.name === savedDefaultConnection)) {
          // Se a conexão padrão não existe mais, remover ela
          console.log('🧹 [ChatArea] Removing invalid default connection:', savedDefaultConnection)
          localStorage.removeItem('defaultConnection')
          setDefaultConnection(undefined)
          setSelectedConnectionName(undefined)
        }
      } catch (error) {
        console.error('❌ [ChatArea] Erro ao buscar conexões:', error)
      }
    }

    fetchConnections()

    // Configurar listener para mudanças na tabela conexoes
    const channel = supabase
      .channel('conexoes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conexoes'
        },
        (payload) => {
          console.log('🔔 [ChatArea] Connection changed:', payload)
          fetchConnections() // Recarregar conexões quando houver mudanças
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, userProfile])

  // Opções de conexão baseadas nas conexões reais
  const connectionOptions = connections.map(conn => ({
    name: conn.name,
    originalName: conn.whatsapp_contact,
    channel: conn.channel || 'whatsapp'
  }))

  // Auto-scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
      if (scrollContainer) {
        ;(scrollContainer as any).scrollTop = (scrollContainer as any).scrollHeight
      }
    }
  }, [messages])

  // Ao selecionar conversa, garantir que a barra de digitação apareça e manter conexão padrão
  useEffect(() => {
    // Resetar estado de edição ao trocar de conversa
    setIsEditingName(false)
    setEditedName(conversation.contact_name)
    
    // scroll mensagens para o final
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
      if (viewport) viewport.scrollTop = viewport.scrollHeight
    }
    // scroll da página até a barra de digitação
    if (inputBarRef.current) {
      inputBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    // focar o input
    if (messageInputRef.current) {
      setTimeout(() => messageInputRef.current?.focus(), 50)
    }
    
    // Restaurar conexão padrão se não há uma selecionada
    if (!selectedConnectionName && defaultConnection) {
      setSelectedConnectionName(defaultConnection)
    }
  }, [conversation.id, defaultConnection, selectedConnectionName])

  // Garantir que a conexão padrão seja aplicada quando as conexões carregam
  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionName && defaultConnection) {
      const connectionExists = connections.some(conn => conn.name === defaultConnection)
      if (connectionExists) {
        setSelectedConnectionName(defaultConnection)
      }
    }
  }, [connections, defaultConnection, selectedConnectionName])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || isSending) return
    
    try {
      await sendMessage({ content: newMessage.trim(), connectionName: selectedConnectionName })
      setNewMessage("")
      
      // Manter o foco no input após enviar mensagem - usar setTimeout para garantir que seja aplicado após a limpeza
      setTimeout(() => {
        if (messageInputRef.current) {
          messageInputRef.current.focus()
        }
      }, 10)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleClearMessages = async () => {
    try {
      await clearMessages()
      
      toast({
        title: "Mensagens apagadas",
        description: "Todas as mensagens desta conversa foram apagadas.",
      })
    } catch (error) {
      console.error('Erro ao apagar mensagens:', error)
      toast({
        title: "Erro",
        description: "Erro ao apagar mensagens. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const formatMessageTime = (dateString: string | null) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
    } catch {
      return ''
    }
  }

  const getChannelIcon = (channel: string | null) => {
    switch (channel) {
      case 'whatsapp':
        return '📱'
      case 'instagram':
        return '📷'
      case 'messenger':
        return '💬'
      default:
        return '💭'
    }
  }

  const getAccountColor = (account: string) => {
    // Paleta de cores para diferenciar contas
    const colors = [
      'bg-green-500 text-white',
      'bg-blue-500 text-white', 
      'bg-purple-500 text-white',
      'bg-orange-500 text-white',
      'bg-pink-500 text-white',
      'bg-teal-500 text-white',
      'bg-indigo-500 text-white',
      'bg-red-500 text-white',
      'bg-yellow-500 text-black',
      'bg-cyan-500 text-black'
    ]
    
    // Gerar hash simples da string da conta
    let hash = 0
    for (let i = 0; i < account.length; i++) {
      hash = account.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // Usar o hash para selecionar uma cor da paleta
    const colorIndex = Math.abs(hash) % colors.length
    return colors[colorIndex]
  }

  const getAccountBadge = (account: string | null) => {
    return account ? (
      <Badge className={getAccountColor(account)}>{account}</Badge>
    ) : (
      <Badge className="bg-gray-500 text-white">Sem conta</Badge>
    )
  }

  const handleToggleAgentStatus = async () => {
    const newStatus = conversation.status_agent === 'Ativo' ? 'Inativo' : 'Ativo'
    
    setIsUpdatingAgentStatus(true)
    
    try {
      await onUpdateAgentStatus(conversation.id, newStatus)
      
      toast({
        title: "Status atualizado",
        description: `Agente de IA ${newStatus === 'Ativo' ? 'ativado' : 'desativado'} com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao atualizar status do agente:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do agente. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingAgentStatus(false)
    }
  }

  const handleSetDefaultConnection = () => {
    if (selectedConnectionName) {
      localStorage.setItem('defaultConnection', selectedConnectionName)
      setDefaultConnection(selectedConnectionName)
      toast({
        title: "Conexão padrão definida",
        description: `"${selectedConnectionName}" foi definida como conexão padrão.`,
      })
    }
  }

  const handleRemoveDefaultConnection = () => {
    localStorage.removeItem('defaultConnection')
    setDefaultConnection(undefined)
    toast({
      title: "Conexão padrão removida",
      description: "Nenhuma conexão está mais definida como padrão.",
    })
  }

  const handleStartEditName = () => {
    setIsEditingName(true)
    setEditedName(conversation.contact_name)
    // Focar no input após o estado atualizar
    setTimeout(() => {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }, 10)
  }

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast({
        title: "Erro",
        description: "Nome não pode estar vazio",
        variant: "destructive"
      })
      return
    }

    if (editedName.trim() === conversation.contact_name) {
      setIsEditingName(false)
      return
    }

    try {
      await updateContactName.mutateAsync({
        conversationId: conversation.id,
        contactId: conversation.contact_id,
        newName: editedName.trim()
      })
      setIsEditingName(false)
    } catch (error) {
      // Error is handled by the hook
      setEditedName(conversation.contact_name) // Revert on error
    }
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setEditedName(conversation.contact_name)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const renderAgentStatusButton = () => {
    if (!conversation.have_agent) return null

    const isActive = conversation.status_agent === 'Ativo'
    const buttonText = isActive ? 'Ativo' : 'Inativo'
    const buttonClass = isActive 
      ? 'bg-green-500 hover:bg-green-600 text-white' 
      : 'bg-red-500 hover:bg-red-600 text-white'

    const actionText = isActive ? 'desativar' : 'ativar'
    const newStatusText = isActive ? 'Inativo' : 'Ativo'

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className={`px-3 py-1 text-xs ${buttonClass}`}
            size="sm"
            disabled={isUpdatingAgentStatus}
          >
            {isUpdatingAgentStatus ? 'Atualizando...' : buttonText}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? 'Desativar' : 'Ativar'} agente de IA
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {actionText} as respostas automáticas do agente de IA para esta conversa? 
              O status será alterado para "{newStatusText}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingAgentStatus}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleAgentStatus}
              disabled={isUpdatingAgentStatus}
            >
              {isUpdatingAgentStatus ? 'Atualizando...' : (isActive ? 'Desativar' : 'Ativar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header da conversa */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.contact_avatar || undefined} alt={conversation.contact_name} />
            <AvatarFallback className="bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <Input
                    ref={nameInputRef}
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    className="h-7 text-sm font-semibold"
                    maxLength={50}
                    disabled={updateContactName.isPending}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={handleSaveName}
                    disabled={updateContactName.isPending}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={handleCancelEdit}
                    disabled={updateContactName.isPending}
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{conversation.contact_name}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    onClick={handleStartEditName}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{getChannelIcon(conversation.channel)} {conversation.channel || 'Chat'}</span>
              {getAccountBadge(conversation.account)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {renderAgentStatusButton()}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteConversation(conversation.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Área das mensagens */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-background">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-muted-foreground">Carregando mensagens...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-muted-foreground">Nenhuma mensagem ainda</div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.numero}
                className={`flex ${message.direcao === 'sent' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.mensagem_is_agent === true
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : message.direcao === 'sent'
                        ? 'bg-abba-green text-abba-black'
                        : 'bg-muted text-foreground'
                  }`}
                >
                  {/* Informações da conexão e usuário */}
                  <div className="text-xs opacity-50 mb-0.5 border-b border-current/5 pb-0.5">
                    <div className="flex flex-col text-[9px] leading-tight">
                      <span>Conexão: {conversation.account || 'N/A'}</span>
                      <span>Usuário: {message.direcao === 'sent' ? 'Você' : (message.nome_contato || conversation.contact_name)}</span>
                    </div>
                  </div>
                  {(() => {
                    const fileInfo = detectFileInMessage(message.mensagem)
                    const linkInfo = detectLinksInMessage(message.mensagem)
                    
                    // Se tem arquivo, mostrar o componente de mídia
                    if (fileInfo) {
                      return (
                        <MediaMessage
                          fileInfo={fileInfo}
                          messageText={message.mensagem}
                          isOutgoing={message.direcao === 'sent'}
                        />
                      )
                    }
                    
                    // Se tem links, mostrar o componente de links
                    if (linkInfo.length > 0) {
                      return (
                        <LinkMessage
                          links={linkInfo}
                          messageText={message.mensagem}
                          isOutgoing={message.direcao === 'sent'}
                        />
                      )
                    }
                    
                    // Texto simples
                    return <p className="text-sm">{message.mensagem}</p>
                  })()}
                  <p className="text-xs opacity-70 mt-1">
                    {formatMessageTime(message.data_hora)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Campo de entrada de mensagem */}
      <form ref={inputBarRef} onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <Select value={selectedConnectionName} onValueChange={setSelectedConnectionName}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Escolha a conexão" />
                </SelectTrigger>
                <SelectContent>
                  {connectionOptions.map((opt) => (
                    <SelectItem key={opt.name} value={opt.name}>
                      {opt.name} • {getChannelIcon(opt.channel)} {opt.channel}
                      {defaultConnection === opt.name && " ⭐"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedConnectionName && (
              <div className="flex gap-1">
                {defaultConnection !== selectedConnectionName ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSetDefaultConnection}
                    className="px-2"
                    title="Definir como padrão"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveDefaultConnection}
                    className="px-2 text-yellow-600"
                    title="Remover como padrão"
                  >
                    <Star className="h-3 w-3 fill-current" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex w-full gap-2">
            <Input
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-background border-border text-foreground focus:border-abba-green"
              disabled={isSending || conversation.status === 'fechada'}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending || conversation.status === 'fechada' || !selectedConnectionName}
              className="bg-abba-green text-abba-black hover:bg-abba-green/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {conversation.status === 'fechada' && (
          <p className="text-xs text-muted-foreground mt-2">Esta conversa está fechada. Reabra-a para enviar mensagens.</p>
        )}
      </form>
    </div>
  )
}
