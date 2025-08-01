import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Edit, X, Phone, Mail, Instagram, Building, MapPin, FileText, DollarSign, Calendar, User, ArrowLeft } from "lucide-react";
import { CRMConversation } from "@/hooks/useCRMConversations";
import { useContactDetails } from "@/hooks/useContactDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatArea } from "@/components/ChatArea";
import { ContactForm } from "@/components/ContactForm";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { useConversationAttachments } from "@/hooks/useConversationAttachments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Conversation } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";
interface LeadDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: CRMConversation | null;
  onOpenChat?: (conversation: CRMConversation) => void;
}
const statusLabels = {
  'novo': 'Novo',
  'em_andamento': 'Em Andamento',
  'qualificado': 'Qualificado',
  'convertido': 'Convertido',
  'perdido': 'Perdido'
};
const statusColors = {
  'novo': 'bg-blue-500',
  'em_andamento': 'bg-abba-blue',
  'qualificado': 'bg-green-500',
  'convertido': 'bg-emerald-600',
  'perdido': 'bg-red-500'
};
const channelLabels = {
  'instagram': 'Instagram',
  'whatsapp': 'WhatsApp',
  'messenger': 'Messenger',
  'email': 'E-mail',
  'telefone': 'Telefone',
  'site': 'Site',
  'indicacao': 'Indicação'
};
export const LeadDetailsDialog = ({
  isOpen,
  onClose,
  conversation,
  onOpenChat
}: LeadDetailsDialogProps) => {
  const {
    data: contact,
    isLoading
  } = useContactDetails(conversation?.contact_id || null);
  const [chatMode, setChatMode] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const {
    uploadAttachment,
    isUploading
  } = useConversationAttachments(conversation?.id || null);

  // Convert CRMConversation to Conversation format for ChatArea
  const convertToConversation = (crmConv: CRMConversation): Conversation => ({
    id: crmConv.id,
    user_id: '',
    // Will be filled by ChatArea
    contact_name: crmConv.contact_name,
    contact_phone: null,
    contact_username: null,
    contact_avatar: null,
    status: crmConv.status as any,
    channel: null,
    last_message: null,
    last_message_at: null,
    profile: null,
    account: null,
    unread_count: 0,
    have_agent: false,
    status_agent: null,
    created_at: crmConv.created_at,
    updated_at: crmConv.updated_at,
    contact_id: crmConv.contact_id || null
  });
  const handleDeleteConversation = async (conversationId: string) => {
    toast({
      title: "Funcionalidade não disponível",
      description: "A exclusão de conversas deve ser feita na aba Chat.",
      variant: "destructive"
    });
  };
  const handleUpdateAgentStatus = async (conversationId: string, newStatus: 'Ativo' | 'Inativo') => {
    toast({
      title: "Funcionalidade não disponível",
      description: "A atualização do status do agente deve ser feita na aba Chat.",
      variant: "destructive"
    });
  };
  const handleOpenChat = () => {
    setChatMode(true);
  };
  const handleBackToDetails = () => {
    setChatMode(false);
  };
  const handleFileUpload = (file: File) => {
    if (conversation?.id) {
      uploadAttachment({
        file,
        conversationId: conversation.id
      });
      setUploadDialogOpen(false);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-abba-gray border-abba-gray ${chatMode ? 'max-w-6xl w-[95vw] h-[90vh]' : 'max-w-2xl max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            {chatMode && <Button variant="ghost" size="sm" onClick={handleBackToDetails} className="text-abba-text hover:bg-abba-black">
                <ArrowLeft className="w-4 h-4" />
              </Button>}
            <DialogTitle className="text-abba-text text-xl">
              {chatMode ? 'Chat' : 'Detalhes do Lead'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {chatMode && conversation ? <div className="flex-1 overflow-hidden">
            <ChatArea conversation={convertToConversation(conversation)} onDeleteConversation={handleDeleteConversation} onUpdateAgentStatus={handleUpdateAgentStatus} />
          </div> : <div className="overflow-y-auto">
              {isLoading ? <div className="space-y-4">
                  <Skeleton className="h-8 w-full bg-abba-black" />
                  <Skeleton className="h-20 w-full bg-abba-black" />
                  <Skeleton className="h-16 w-full bg-abba-black" />
                </div> : contact ? <div className="space-y-6">
                  {/* Header com nome e status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-abba-text">
                        {contact.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${statusColors[contact.status as keyof typeof statusColors] || 'bg-gray-500'} text-white`}>
                          {statusLabels[contact.status as keyof typeof statusLabels] || contact.status}
                        </Badge>
                        {contact.channel && <Badge variant="outline" className="border-abba-green text-abba-green">
                            {channelLabels[contact.channel as keyof typeof channelLabels] || contact.channel}
                          </Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ContactForm trigger={<Button variant="outline" size="sm" className="border-abba-green text-abba-green hover:bg-abba-green hover:text-gray-400">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>} contact={contact} />
                      {conversation && <Button onClick={handleOpenChat} size="sm" className="bg-abba-green text-abba-black hover:bg-abba-green-light">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>}
                    </div>
                  </div>

                  <Separator className="bg-abba-black" />

                  {/* Attachments Panel */}
                  {conversation && <AttachmentsPanel conversationId={conversation.id} onUploadClick={() => setUploadDialogOpen(true)} />}

                  <Separator className="bg-abba-black" />

                  {/* Informações de Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.email && <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-abba-green" />
                        <div>
                          <p className="text-sm text-gray-400">E-mail</p>
                          <p className="text-abba-text">{contact.email}</p>
                        </div>
                      </div>}
                    
                    {contact.phone && <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-abba-green" />
                        <div>
                          <p className="text-sm text-gray-400">Telefone</p>
                          <p className="text-abba-text">{contact.phone}</p>
                        </div>
                      </div>}

                    {contact.instagram && <div className="flex items-center gap-3">
                        <Instagram className="w-4 h-4 text-abba-green" />
                        <div>
                          <p className="text-sm text-gray-400">Instagram</p>
                          <p className="text-abba-text">{contact.instagram}</p>
                        </div>
                      </div>}

                    {contact.company && <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-abba-green" />
                        <div>
                          <p className="text-sm text-gray-400">Empresa</p>
                          <p className="text-abba-text">{contact.company}</p>
                        </div>
                      </div>}
                  </div>

                  {/* Informações Adicionais */}
                  <div className="space-y-4">
                    {contact.position && <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-abba-green" />
                        <div>
                          <p className="text-sm text-gray-400">Cargo</p>
                          <p className="text-abba-text">{contact.position}</p>
                        </div>
                      </div>}

                    {contact.address && <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-abba-green" />
                        <div>
                          <p className="text-sm text-gray-400">Endereço</p>
                          <p className="text-abba-text">{contact.address}</p>
                        </div>
                      </div>}

                    {contact.value && contact.value > 0 && <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-abba-green" />
                        <div>
                          <p className="text-sm text-gray-400">Valor Estimado</p>
                          <p className="text-abba-text">
                            R$ {contact.value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                          </p>
                        </div>
                      </div>}
                  </div>

                  {/* Tags */}
                  {contact.tags && contact.tags.length > 0 && <div>
                      <p className="text-sm text-gray-400 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {contact.tags.map(tag => <Badge key={tag.id} style={{
                backgroundColor: tag.color
              }} className="text-white">
                            {tag.name}
                          </Badge>)}
                      </div>
                    </div>}

                  {/* Notas */}
                  {contact.notes && <div className="flex gap-3">
                      <FileText className="w-4 h-4 text-abba-green mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Notas</p>
                        <p className="text-abba-text">{contact.notes}</p>
                      </div>
                    </div>}

                  <Separator className="bg-abba-black" />

                  {/* Informações do Sistema */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p>Criado em</p>
                        <p className="text-abba-text">
                          {format(new Date(contact.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR
                  })}
                        </p>
                      </div>
                    </div>
                    
                    {contact.last_contact_date && <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <p>Último contato</p>
                          <p className="text-abba-text">
                            {format(new Date(contact.last_contact_date), "dd/MM/yyyy", {
                    locale: ptBR
                  })}
                          </p>
                        </div>
                      </div>}

                    {contact.source && <div>
                        <p>Origem</p>
                        <p className="text-abba-text">{contact.source}</p>
                      </div>}

                    {contact.user && <div>
                        <p>Usuário responsável</p>
                        <p className="text-abba-text">{contact.user.full_name}</p>
                      </div>}
                  </div>
                </div> : <div className="text-center py-8">
                  <p className="text-gray-400">Nenhuma informação de contato encontrada.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Este lead ainda não está vinculado a um contato.
                  </p>
                </div>}
            </div>}
        
        {/* File Upload Dialog */}
        <FileUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUpload={handleFileUpload} isUploading={isUploading} />
      </DialogContent>
    </Dialog>;
};