
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useContacts, Contact } from "@/hooks/useContacts"
import { useUsers } from "@/hooks/useUsers"
import { toast } from "@/hooks/use-toast"

interface ContactFormData {
  name: string
  email: string
  phone: string
  instagram: string
  company: string
  position: string
  address: string
  cpf_cnpj: string
  notes: string
  status: Contact['status']
  channel?: Contact['channel']
  source: string
  agent_assigned: string
  user_id: string
  value: number
}

interface ContactFormProps {
  trigger?: React.ReactNode
  contact?: Contact
  onClose?: () => void
  onSuccess?: () => void
  isAdmin?: boolean
}

export const ContactForm = ({ trigger, contact, onClose, onSuccess, isAdmin = true }: ContactFormProps) => {
  const { createContact, updateContact, isCreating, isUpdating } = useContacts()
  const { users } = useUsers()
  const [open, setOpen] = useState(false)
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    instagram: contact?.instagram || '',
    company: contact?.company || '',
    position: contact?.position || '',
    address: contact?.address || '',
    cpf_cnpj: contact?.cpf_cnpj || '',
    notes: contact?.notes || '',
    status: contact?.status || 'novo',
    channel: contact?.channel || undefined,
    source: contact?.source || '',
    agent_assigned: contact?.agent_assigned || '',
    user_id: contact?.user_id || '',
    value: contact?.value || 0,
  })

  // Input sanitization function
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      })
      return
    }

    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
      toast({
        title: "Erro",
        description: "Email inválido",
        variant: "destructive",
      })
      return
    }

    // Validate phone if provided
    if (formData.phone && !isValidPhone(formData.phone)) {
      toast({
        title: "Erro", 
        description: "Telefone inválido",
        variant: "destructive",
      })
      return
    }

    const submitData = {
      ...formData,
      name: sanitizeInput(formData.name),
      email: formData.email ? sanitizeInput(formData.email) : undefined,
      phone: formData.phone ? sanitizeInput(formData.phone) : undefined,
      instagram: formData.instagram ? sanitizeInput(formData.instagram) : undefined,
      company: formData.company ? sanitizeInput(formData.company) : undefined,
      position: formData.position ? sanitizeInput(formData.position) : undefined,
      address: formData.address ? sanitizeInput(formData.address) : undefined,
      cpf_cnpj: formData.cpf_cnpj ? sanitizeInput(formData.cpf_cnpj) : undefined,
      notes: formData.notes ? sanitizeInput(formData.notes) : undefined,
      source: formData.source ? sanitizeInput(formData.source) : undefined,
      agent_assigned: formData.agent_assigned ? sanitizeInput(formData.agent_assigned) : undefined,
      user_id: formData.user_id || undefined,
      value: formData.value,
    }

    // Executar a operação e aguardar conclusão
    try {
      if (contact) {
        await updateContact({ id: contact.id, ...submitData })
      } else {
        await createContact(submitData)
      }
      
      // Chamar callback de sucesso após operação completada
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar contato:', error)
    }
    
    setOpen(false)
    onClose?.()
    
    // Reset form if creating new contact
    if (!contact) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        instagram: '',
        company: '',
        position: '',
        address: '',
        cpf_cnpj: '',
        notes: '',
        status: 'novo',
        channel: undefined,
        source: '',
        agent_assigned: '',
        user_id: '',
        value: 0,
      })
    }
  }

  const defaultTrigger = (
    <Button className="bg-abba-green text-abba-black hover:bg-abba-green-light">
      <Plus className="w-4 h-4 mr-2" />
      Novo Contato
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {contact ? 'Editar Contato' : 'Novo Contato'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {contact ? 'Atualize as informações do contato' : 'Adicione um novo contato ao seu sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`bg-background border-border text-foreground ${!isAdmin ? 'blur-sm' : ''}`}
                placeholder="+55 11 99999-9999"
                disabled={!isAdmin}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-foreground">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="@usuario"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj" className="text-foreground">CPF/CNPJ</Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position" className="text-foreground">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground">Status</Label>
              <Select value={formData.status} onValueChange={(value: Contact['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="qualificado">Qualificado</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel" className="text-foreground">Canal</Label>
              <Select value={formData.channel || ''} onValueChange={(value: Contact['channel']) => setFormData(prev => ({ ...prev, channel: value }))}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecione um canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source" className="text-foreground">Fonte</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="Stories, Post, Bio Link, etc."
              />
            </div>
            
            
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="user" className="text-foreground">Usuário Responsável</Label>
                <Select value={formData.user_id} onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="agent" className="text-foreground">Agente Responsável</Label>
              <Input
                id="agent"
                value={formData.agent_assigned}
                onChange={(e) => setFormData(prev => ({ ...prev, agent_assigned: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value" className="text-foreground">Valor Estimado (R$)</Label>
              <Input
                id="value"
                type="text"
                inputMode="decimal"
                value={formData.value === 0 ? '' : formData.value.toString()}
                onChange={(e) => {
                  const value = e.target.value.replace(',', '.')
                  const numericValue = parseFloat(value) || 0
                  setFormData(prev => ({ ...prev, value: numericValue }))
                }}
                className="bg-background border-border text-foreground [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                placeholder="0,00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-foreground">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="bg-background border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-background border-border text-foreground min-h-[100px]"
              placeholder="Adicione observações sobre o contato..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating}
              className="bg-abba-green text-abba-black hover:bg-abba-green/90"
            >
              {contact ? 'Atualizar' : 'Criar'} Contato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
