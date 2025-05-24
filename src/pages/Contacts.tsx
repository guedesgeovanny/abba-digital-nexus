
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, MessageCircle, Instagram, Phone, Mail, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    source: "Stories"
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
    source: "Link Bio"
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
    source: "Anúncio"
  }
]

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterChannel, setFilterChannel] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const filteredContacts = mockContacts.filter(contact => {
    return (
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                  placeholder="Buscar por nome ou email..."
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
                <SelectItem value="">Todos os canais</SelectItem>
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
                <SelectItem value="">Todos os status</SelectItem>
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
                  <TableRow key={contact.id} className="border-abba-gray hover:bg-abba-gray/50">
                    <TableCell>
                      <div className="font-medium text-abba-text">{contact.name}</div>
                      <div className="text-sm text-gray-400">{contact.email}</div>
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
    </div>
  )
}

export default Contacts
