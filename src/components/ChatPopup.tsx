
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, X, Phone, Mail, Instagram, Calendar } from "lucide-react"
import { useMessages } from "@/hooks/useMessages"
import { useConversations } from "@/hooks/useConversations"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
  deal?: any | null  // Temporarily any while refactoring
}

export const ChatPopup = ({ isOpen, onClose, deal }: ChatPopupProps) => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  
  const { conversations, createConversation, isLoading: conversationsLoading } = useConversations()
  const { messages, sendMessage, isSending, isLoading: messagesLoading } = useMessages(conversationId)

  // Buscar ou criar conversa quando a popup abrir
  useEffect(() => {
    if (isOpen && deal && !conversationId) {
      findOrCreateConversation()
    }
  }, [isOpen, deal])

  // Limpar estado quando fechar
  useEffect(() => {
    if (!isOpen) {
      setConversationId(null)
      setMessageInput("")
    }
  }, [isOpen])

  const findOrCreateConversation = async () => {
    if (!deal) return

    setIsLoadingConversation(true)
    try {
      // Buscar conversa existente pelo telefone ou nome do contato
      const existingConversation = conversations.find(conv => 
        conv.contact_phone === deal.contact || 
        conv.contact_name.toLowerCase() === deal.name.toLowerCase()
      )

      if (existingConversation) {
        setConversationId(existingConversation.id)
      } else {
        // Criar nova conversa
        const newConversation = await createConversation({
          contact_name: deal.name,
          contact_phone: deal.contact,
          contact_username: deal.instagram,
          channel: getChannelFromSource(deal.source),
          last_message: "Conversa iniciada pelo CRM"
        })
        
        if (newConversation) {
          setConversationId(newConversation.id)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar/criar conversa:', error)
    } finally {
      setIsLoadingConversation(false)
    }
  }

  const getChannelFromSource = (source: string): 'whatsapp' | 'instagram' | 'messenger' | undefined => {
    const lowerSource = source.toLowerCase()
    if (lowerSource.includes('whatsapp')) return 'whatsapp'
    if (lowerSource.includes('instagram')) return 'instagram'
    if (lowerSource.includes('messenger')) return 'messenger'
    return undefined
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId) return

    try {
      await sendMessage({ content: messageInput.trim() })
      setMessageInput("")
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!deal) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-abba-gray border-abba-gray max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b border-abba-gray pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={deal.name} />
                <AvatarFallback className="bg-abba-green text-abba-black">
                  {deal.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-abba-text">{deal.name}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {deal.contact && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {deal.contact}
                    </div>
                  )}
                  {deal.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {deal.email}
                    </div>
                  )}
                  {deal.instagram && (
                    <div className="flex items-center gap-1">
                      <Instagram className="w-3 h-3" />
                      {deal.instagram}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Área de mensagens */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            {isLoadingConversation || conversationsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Carregando conversa...</div>
              </div>
            ) : messagesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Carregando mensagens...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Nenhuma mensagem ainda. Comece a conversa!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.numero}
                    className={`flex ${message.direcao === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-xs lg:max-w-md">
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.mensagem_is_agent === true
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                            : message.direcao === 'sent'
                              ? 'bg-abba-green text-abba-black'
                              : 'bg-abba-gray text-abba-text'
                        }`}
                      >
                        <p className="text-sm">{message.mensagem}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 px-1">
                        {message.data_hora ? format(new Date(message.data_hora), 'HH:mm', { locale: ptBR }) : ''}
                        {message.mensagem_is_agent && ' • Agente IA'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input de mensagem */}
          <div className="border-t border-abba-gray p-4">
            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-abba-black border-abba-gray text-abba-text"
                disabled={!conversationId || isLoadingConversation}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSending || !conversationId || isLoadingConversation}
                className="bg-abba-green text-abba-black hover:bg-abba-green-light"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
