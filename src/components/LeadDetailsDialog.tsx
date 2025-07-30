import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Edit, X, Phone, Mail, Instagram, Building, MapPin, FileText, DollarSign, Calendar, User } from "lucide-react"
import { CRMConversation } from "@/hooks/useCRMConversations"
import { useContactDetails } from "@/hooks/useContactDetails"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LeadDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  conversation: CRMConversation | null
  onOpenChat?: (conversation: CRMConversation) => void
}

const statusLabels = {
  'novo': 'Novo',
  'em_andamento': 'Em Andamento',
  'qualificado': 'Qualificado',
  'convertido': 'Convertido',
  'perdido': 'Perdido'
}

const statusColors = {
  'novo': 'bg-blue-500',
  'em_andamento': 'bg-yellow-500',
  'qualificado': 'bg-green-500',
  'convertido': 'bg-emerald-600',
  'perdido': 'bg-red-500'
}

const channelLabels = {
  'instagram': 'Instagram',
  'whatsapp': 'WhatsApp',
  'messenger': 'Messenger',
  'email': 'E-mail',
  'telefone': 'Telefone',
  'site': 'Site',
  'indicacao': 'Indicação'
}

export const LeadDetailsDialog = ({ isOpen, onClose, conversation, onOpenChat }: LeadDetailsDialogProps) => {
  const { data: contact, isLoading } = useContactDetails(conversation?.contact_id || null)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-abba-gray border-abba-gray max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-abba-text text-xl">
            Detalhes do Lead
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full bg-abba-black" />
            <Skeleton className="h-20 w-full bg-abba-black" />
            <Skeleton className="h-16 w-full bg-abba-black" />
          </div>
        ) : contact ? (
          <div className="space-y-6">
            {/* Header com nome e status */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-abba-text">
                  {contact.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    className={`${statusColors[contact.status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}
                  >
                    {statusLabels[contact.status as keyof typeof statusLabels] || contact.status}
                  </Badge>
                  {contact.channel && (
                    <Badge variant="outline" className="border-abba-green text-abba-green">
                      {channelLabels[contact.channel as keyof typeof channelLabels] || contact.channel}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-abba-green text-abba-green hover:bg-abba-green hover:text-abba-black"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                {conversation && onOpenChat && (
                  <Button
                    onClick={() => onOpenChat(conversation)}
                    size="sm"
                    className="bg-abba-green text-abba-black hover:bg-abba-green-light"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-abba-black" />

            {/* Informações de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-abba-green" />
                  <div>
                    <p className="text-sm text-gray-400">E-mail</p>
                    <p className="text-abba-text">{contact.email}</p>
                  </div>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-abba-green" />
                  <div>
                    <p className="text-sm text-gray-400">Telefone</p>
                    <p className="text-abba-text">{contact.phone}</p>
                  </div>
                </div>
              )}

              {contact.instagram && (
                <div className="flex items-center gap-3">
                  <Instagram className="w-4 h-4 text-abba-green" />
                  <div>
                    <p className="text-sm text-gray-400">Instagram</p>
                    <p className="text-abba-text">{contact.instagram}</p>
                  </div>
                </div>
              )}

              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-abba-green" />
                  <div>
                    <p className="text-sm text-gray-400">Empresa</p>
                    <p className="text-abba-text">{contact.company}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4">
              {contact.position && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-abba-green" />
                  <div>
                    <p className="text-sm text-gray-400">Cargo</p>
                    <p className="text-abba-text">{contact.position}</p>
                  </div>
                </div>
              )}

              {contact.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-abba-green" />
                  <div>
                    <p className="text-sm text-gray-400">Endereço</p>
                    <p className="text-abba-text">{contact.address}</p>
                  </div>
                </div>
              )}

              {contact.value && contact.value > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-abba-green" />
                  <div>
                    <p className="text-sm text-gray-400">Valor Estimado</p>
                    <p className="text-abba-text">
                      R$ {contact.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      style={{ backgroundColor: tag.color }}
                      className="text-white"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            {contact.notes && (
              <div className="flex gap-3">
                <FileText className="w-4 h-4 text-abba-green mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Notas</p>
                  <p className="text-abba-text">{contact.notes}</p>
                </div>
              </div>
            )}

            <Separator className="bg-abba-black" />

            {/* Informações do Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <div>
                  <p>Criado em</p>
                  <p className="text-abba-text">
                    {format(new Date(contact.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {contact.last_contact_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p>Último contato</p>
                    <p className="text-abba-text">
                      {format(new Date(contact.last_contact_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {contact.source && (
                <div>
                  <p>Origem</p>
                  <p className="text-abba-text">{contact.source}</p>
                </div>
              )}

              {contact.agent && (
                <div>
                  <p>Agente responsável</p>
                  <p className="text-abba-text">{contact.agent.name}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Nenhuma informação de contato encontrada.</p>
            <p className="text-sm text-gray-500 mt-2">
              Este lead ainda não está vinculado a um contato.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}