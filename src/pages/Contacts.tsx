
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MessageCircle, Instagram, Phone, Mail, Calendar, X, User, Building2, MapPin, Tag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const mockContacts = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    phone: "+55 11 99999-9999",
    instagram: "@joaosilva",
    channel: "Instagram",
    agent: "Agente Vendas",
    status: "Qualificado",
    tags: ["Interessado", "Premium"],
    lastContact: "2024-01-15",
    source: "Stories",
    company: "Tech Solutions",
    position: "CEO",
    address: "São Paulo, SP",
    notes: "Cliente muito interessado em soluções de automação. Menciona que tem um orçamento aprovado para Q1 2024.",
    deals: ["Automação de Marketing", "CRM Personalizado"],
    conversationHistory: [
      { date: "2024-01-15", message: "Enviou mensagem via Instagram interessado em automação", type: "received" },
      { date: "2024-01-14", message: "Agendou reunião para próxima semana", type: "sent" },
      { date: "2024-01-13", message: "Solicitou orçamento para CRM personalizado", type: "received" }
    ]
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com", 
    phone: "+55 11 88888-8888",
    instagram: "@mariasantos",
    channel: "WhatsApp",
    agent: "Agente Suporte",
    status: "Em andamento",
    tags: ["Dúvida", "Urgente"],
    lastContact: "2024-01-14",
    source: "Link Bio",
    company: "Marketing Pro",
    position: "Diretora de Marketing",
    address: "Rio de Janeiro, RJ",
    notes: "Precisa de uma solução rápida para automação de vendas. Tem deadline apertado.",
    deals: ["Automação de Vendas"],
    conversationHistory: [
      { date: "2024-01-14", message: "Enviou mensagem urgente sobre automação", type: "received" },
      { date: "2024-01-13", message: "Explicou funcionalidades da plataforma", type: "sent" }
    ]
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    phone: "+55 11 77777-7777",
    instagram: "@pedrocosta",
    channel: "Messenger",
    agent: "Agente Marketing",
    status: "Novo",
    tags: ["Lead", "Potencial"],
    lastContact: "2024-01-13",
    source: "Anúncio",
    company: "Digital Agency",
    position: "Fundador",
    address: "Belo Horizonte, MG",
    notes: "Novo lead gerado através de anúncio no Facebook. Demonstrou interesse inicial.",
    deals: [],
    conversationHistory: [
      { date: "2024-01-13", message: "Primeiro contato via Messenger", type: "received" }
    ]
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana@startup.com",
    phone: "+55 11 66666-6666",
    instagram: "@anaoliveira",
    channel: "Instagram",
    agent: "Agente Vendas",
    status: "Qualificado",
    tags: ["Startup", "Tecnologia"],
    lastContact: "2024-01-12",
    source: "Post",
    company: "Startup Inovadora",
    position: "CTO",
    address: "Campinas, SP",
    notes: "CTO de startup em crescimento. Busca soluções escaláveis de automação.",
    deals: ["Plataforma de Automação"],
    conversationHistory: [
      { date: "2024-01-12", message: "Interessada em demonstração da plataforma", type: "received" },
      { date: "2024-01-11", message: "Compartilhou case de sucesso", type: "sent" }
    ]
  },
  {
    id: 5,
    name: "Carlos Ferreira",
    email: "carlos@consultoria.com",
    phone: "+55 11 55555-5555",
    instagram: "@carlosferreira",
    channel: "WhatsApp",
    agent: "Agente Suporte",
    status: "Em andamento",
    tags: ["Consultoria", "B2B"],
    lastContact: "2024-01-11",
    source: "Indicação",
    company: "Consultoria Estratégica",
    position: "Diretor",
    address: "São Paulo, SP",
    notes: "Consultor com vários clientes interessados. Potencial para parcerias.",
    deals: ["Consultoria Premium"],
    conversationHistory: [
      { date: "2024-01-11", message: "Discutiu possibilidade de parceria", type: "received" }
    ]
  },
  {
    id: 6,
    name: "Beatriz Lima",
    email: "beatriz@ecommerce.com",
    phone: "+55 11 44444-4444",
    instagram: "@beatrizlima",
    channel: "Instagram",
    agent: "Agente Marketing",
    status: "Novo",
    tags: ["E-commerce", "Varejo"],
    lastContact: "2024-01-10",
    source: "Stories",
    company: "E-commerce Fashion",
    position: "Gerente de Vendas",
    address: "Porto Alegre, RS",
    notes: "Gerente de e-commerce interessada em automação de atendimento ao cliente.",
    deals: [],
    conversationHistory: [
      { date: "2024-01-10", message: "Primeiro contato via Stories", type: "received" }
    ]
  }
]

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterChannel, setFilterChannel] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredContacts = mockContacts.filter(contact => {
    return (
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    (filterChannel === "" || contact.channel === filterChannel) &&
    (filterStatus === "" || contact.status === filterStatus)
  })

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Instagram":
        return <Instagram className="w-4 h-4" />
      case "WhatsApp":
        return <MessageCircle className="w-4 h-4" />
      case "Messenger":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Qualificado":
        return "bg-green-600"
      case "Em andamento":
        return "bg-yellow-600"
      case "Novo":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  const handleContactClick = (contact: typeof mockContacts[0]) => {
    setSelectedContact(contact)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
        <img 
          src="/lovable-uploads/fb0eee38-84d5-47c6-b95f-cb80e02e53d3.png" 
          alt="Abba Digital" 
          className="w-16 h-16"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-abba-text">Contatos</h2>
          <p className="text-gray-400">
            Gerencie todos os leads que interagiram com seus agentes
          </p>
        </div>
        <Button className="bg-abba-green text-abba-black hover:bg-abba-green-light">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contato
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-abba-black border-abba-gray">
        <CardHeader>
          <CardTitle className="text-abba-text">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-abba-gray border-abba-gray text-abba-text"
                />
              </div>
            </div>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Messenger">Messenger</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Qualificado">Qualificado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-abba-black border-abba-gray">
        <CardHeader>
          <CardTitle className="text-abba-text">Contatos ({filteredContacts.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Lista de todos os contatos e suas informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-abba-gray">
            <Table>
              <TableHeader>
                <TableRow className="border-abba-gray">
                  <TableHead className="text-gray-400">Nome</TableHead>
                  <TableHead className="text-gray-400">Canal</TableHead>
                  <TableHead className="text-gray-400">Contato</TableHead>
                  <TableHead className="text-gray-400">Agente</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Tags</TableHead>
                  <TableHead className="text-gray-400">Último Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow 
                    key={contact.id} 
                    className="border-abba-gray hover:bg-abba-gray/50 cursor-pointer"
                    onClick={() => handleContactClick(contact)}
                  >
                    <TableCell>
                      <div className="font-medium text-abba-text">{contact.name}</div>
                      <div className="text-sm text-gray-400">{contact.company}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(contact.channel)}
                        <span className="text-abba-text">{contact.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" />
                          <span className="text-abba-text">{contact.phone}</span>
                        </div>
                        {contact.instagram && (
                          <div className="flex items-center gap-2 text-sm">
                            <Instagram className="w-3 h-3" />
                            <span className="text-abba-text">{contact.instagram}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-abba-text">{contact.agent}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(contact.status)} text-white`}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-abba-text">
                        <Calendar className="w-3 h-3" />
                        {new Date(contact.lastContact).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Contact Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="bg-abba-black border-l border-abba-gray w-[600px] sm:w-[600px]">
          {selectedContact && (
            <>
              <SheetHeader>
                <SheetTitle className="text-abba-text text-xl">{selectedContact.name}</SheetTitle>
                <SheetDescription className="text-gray-400">
                  {selectedContact.company} • {selectedContact.position}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-abba-text">Informações de Contato</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-abba-text">{selectedContact.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-abba-text">{selectedContact.phone}</span>
                    </div>
                    {selectedContact.instagram && (
                      <div className="flex items-center gap-3">
                        <Instagram className="w-4 h-4 text-gray-400" />
                        <span className="text-abba-text">{selectedContact.instagram}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-abba-text">{selectedContact.company}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-abba-text">{selectedContact.position}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-abba-text">{selectedContact.address}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-abba-gray" />

                {/* Status & Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-abba-text">Status & Tags</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={`${getStatusColor(selectedContact.status)} text-white`}>
                        {selectedContact.status}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">Tags:</span>
                      <div className="flex gap-1 flex-wrap">
                        {selectedContact.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Canal:</span>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(selectedContact.channel)}
                        <span className="text-abba-text">{selectedContact.channel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Agente:</span>
                      <span className="text-abba-text">{selectedContact.agent}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-abba-gray" />

                {/* Deals */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-abba-text">Oportunidades</h3>
                  <div className="space-y-2">
                    {selectedContact.deals.length > 0 ? (
                      selectedContact.deals.map((deal, index) => (
                        <div key={index} className="p-3 bg-abba-gray rounded-lg">
                          <span className="text-abba-text">{deal}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic">Nenhuma oportunidade ativa</p>
                    )}
                  </div>
                </div>

                <Separator className="bg-abba-gray" />

                {/* Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-abba-text">Observações</h3>
                  <div className="p-3 bg-abba-gray rounded-lg">
                    <p className="text-abba-text text-sm">{selectedContact.notes}</p>
                  </div>
                </div>

                <Separator className="bg-abba-gray" />

                {/* Conversation History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-abba-text">Histórico de Conversas</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedContact.conversationHistory.map((conversation, index) => (
                      <div key={index} className="p-3 bg-abba-gray rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">
                            {new Date(conversation.date).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge 
                            variant={conversation.type === 'received' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {conversation.type === 'received' ? 'Recebida' : 'Enviada'}
                          </Badge>
                        </div>
                        <p className="text-abba-text text-sm">{conversation.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Contacts
