import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MessageCircle, Instagram, Phone, Mail, Calendar, User, Building2, MapPin, Tag, Edit, Trash2, Download, FileSpreadsheet } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ContactForm } from "@/components/ContactForm"
import { useContacts, ContactWithTags } from "@/hooks/useContacts"
import { useContactTags } from "@/hooks/useContactTags"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { usePagination } from "@/hooks/usePagination"
import { useContactExport } from "@/hooks/useContactExport"

const Contacts = () => {
  const { contacts, isLoading, deleteContact } = useContacts()
  const { tags } = useContactTags()
  const { exportToCSV } = useContactExport()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterChannel, setFilterChannel] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTag, setFilterTag] = useState("all")
  const [selectedContact, setSelectedContact] = useState<ContactWithTags | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesChannel = filterChannel === "all" || contact.channel === filterChannel
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus
    const matchesTag = filterTag === "all" || contact.tags.some(tag => tag.name === filterTag)

    return matchesSearch && matchesChannel && matchesStatus && matchesTag
  })

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData: paginatedContacts,
    handlePageChange,
    handleItemsPerPageChange,
    startItem,
    endItem,
    resetPage,
    itemsPerPageOptions
  } = usePagination({ data: filteredContacts })

  // Reset page when filters change
  useEffect(() => {
    resetPage()
  }, [searchTerm, filterChannel, filterStatus, filterTag, resetPage])

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case "instagram":
        return <Instagram className="w-4 h-4" />
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />
      case "messenger":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "qualificado":
        return "bg-green-600"
      case "em_andamento":
        return "bg-abba-blue"
      case "novo":
        return "bg-blue-600"
      case "convertido":
        return "bg-purple-600"
      case "perdido":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "novo":
        return "Novo"
      case "em_andamento":
        return "Em andamento"
      case "qualificado":
        return "Qualificado"
      case "convertido":
        return "Convertido"
      case "perdido":
        return "Perdido"
      default:
        return status
    }
  }

  const getChannelLabel = (channel?: string) => {
    switch (channel) {
      case "instagram":
        return "Instagram"
      case "whatsapp":
        return "WhatsApp"
      case "messenger":
        return "Messenger"
      case "email":
        return "Email"
      case "telefone":
        return "Telefone"
      case "site":
        return "Site"
      case "indicacao":
        return "Indicação"
      default:
        return "N/A"
    }
  }

  const handleContactClick = (contact: ContactWithTags) => {
    setSelectedContact(contact)
    setIsDetailOpen(true)
  }

  const handleDeleteContact = (contactId: string) => {
    deleteContact(contactId)
  }

  const handleExportCSV = () => {
    exportToCSV(filteredContacts)
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-abba-text">Carregando contatos...</div>
        </div>
      </div>
    )
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
        <ContactForm />
      </div>

      {/* Filters */}
      <Card className="bg-abba-black border-abba-gray">
        <CardHeader>
          <CardTitle className="text-abba-text">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
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
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="messenger">Messenger</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="qualificado">Qualificado</SelectItem>
                <SelectItem value="convertido">Convertido</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card className="bg-abba-black border-abba-gray">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-abba-text">
                Contatos ({filteredContacts.length})
              </CardTitle>
              <CardDescription className="text-gray-400">
                Lista de todos os contatos e suas informações
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              className="border-abba-gray text-abba-text hover:bg-abba-gray"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
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
                  <TableHead className="text-gray-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContacts.map((contact) => (
                  <TableRow 
                    key={contact.id} 
                    className="border-abba-gray hover:bg-abba-gray/50 cursor-pointer"
                    onClick={() => handleContactClick(contact)}
                  >
                    <TableCell>
                      <div className="font-medium text-abba-text">{contact.name}</div>
                      <div className="text-sm text-gray-400">{contact.company || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(contact.channel)}
                        <span className="text-abba-text">{getChannelLabel(contact.channel)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3" />
                            <span className="text-abba-text">{contact.phone}</span>
                          </div>
                        )}
                        {contact.instagram && (
                          <div className="flex items-center gap-2 text-sm">
                            <Instagram className="w-3 h-3" />
                            <span className="text-abba-text">{contact.instagram}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3" />
                            <span className="text-abba-text">{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-abba-text">{contact.agent_assigned || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(contact.status)} text-white`}>
                        {getStatusLabel(contact.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags?.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-abba-text">
                        <Calendar className="w-3 h-3" />
                        {contact.last_contact_date ? new Date(contact.last_contact_date).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <ContactForm
                          contact={contact}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-abba-black border-abba-gray">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-abba-text">Excluir Contato</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Tem certeza que deseja excluir o contato "{contact.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-abba-gray text-abba-text hover:bg-abba-gray">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteContact(contact.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedContacts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                      Nenhum contato encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {filteredContacts.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Itens por página:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => handleItemsPerPageChange(Number(value))}
                  >
                    <SelectTrigger className="w-[80px] bg-abba-gray border-abba-gray text-abba-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {itemsPerPageOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-gray-400">
                  Mostrando {startItem}-{endItem} de {filteredContacts.length} contatos
                </span>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
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
                  {selectedContact.company || 'N/A'} • {selectedContact.position || 'N/A'}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-abba-text">Informações de Contato</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedContact.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-abba-text">{selectedContact.email}</span>
                      </div>
                    )}
                    {selectedContact.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-abba-text">{selectedContact.phone}</span>
                      </div>
                    )}
                    {selectedContact.instagram && (
                      <div className="flex items-center gap-3">
                        <Instagram className="w-4 h-4 text-gray-400" />
                        <span className="text-abba-text">{selectedContact.instagram}</span>
                      </div>
                    )}
                    {selectedContact.company && (
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-abba-text">{selectedContact.company}</span>
                      </div>
                    )}
                    {selectedContact.position && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-abba-text">{selectedContact.position}</span>
                      </div>
                    )}
                    {selectedContact.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-abba-text">{selectedContact.address}</span>
                      </div>
                    )}
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
                        {getStatusLabel(selectedContact.status)}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">Tags:</span>
                      <div className="flex gap-1 flex-wrap">
                        {selectedContact.tags?.length > 0 ? (
                          selectedContact.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                              <Tag className="w-3 h-3 mr-1" />
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">Nenhuma tag</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Canal:</span>
                      <div className="flex items-center gap-2">
                        {getChannelIcon(selectedContact.channel)}
                        <span className="text-abba-text">{getChannelLabel(selectedContact.channel)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Agente:</span>
                      <span className="text-abba-text">{selectedContact.agent_assigned || 'N/A'}</span>
                    </div>
                    {selectedContact.source && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Fonte:</span>
                        <span className="text-abba-text">{selectedContact.source}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-abba-gray" />

                {/* Notes */}
                {selectedContact.notes && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-abba-text">Observações</h3>
                      <div className="p-3 bg-abba-gray rounded-lg">
                        <p className="text-abba-text text-sm">{selectedContact.notes}</p>
                      </div>
                    </div>
                    <Separator className="bg-abba-gray" />
                  </>
                )}

                {/* Created/Updated Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-abba-text">Informações do Sistema</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Criado em:</span>
                      <span className="text-abba-text">
                        {new Date(selectedContact.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedContact.created_at).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Última atualização:</span>
                      <span className="text-abba-text">
                        {new Date(selectedContact.updated_at).toLocaleDateString('pt-BR')} às {new Date(selectedContact.updated_at).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
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
