
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useContacts, Contact } from "@/hooks/useContacts"

interface ContactFormData {
  name: string
  email: string
  phone: string
  instagram: string
  company: string
  position: string
  address: string
  notes: string
  status: Contact['status']
  channel?: Contact['channel']
  source: string
  agent_assigned: string
  value: number
}

interface ContactFormProps {
  trigger?: React.ReactNode
  contact?: Contact
  onClose?: () => void
}

export const ContactForm = ({ trigger, contact, onClose }: ContactFormProps) => {
  const { createContact, updateContact, isCreating, isUpdating } = useContacts()
  const [open, setOpen] = useState(false)
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    instagram: contact?.instagram || '',
    company: contact?.company || '',
    position: contact?.position || '',
    address: contact?.address || '',
    notes: contact?.notes || '',
    status: contact?.status || 'novo',
    channel: contact?.channel || undefined,
    source: contact?.source || '',
    agent_assigned: contact?.agent_assigned || '',
    value: contact?.value || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    const submitData = {
      ...formData,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      instagram: formData.instagram || undefined,
      company: formData.company || undefined,
      position: formData.position || undefined,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      source: formData.source || undefined,
      agent_assigned: formData.agent_assigned || undefined,
    }

    if (contact) {
      updateContact({ id: contact.id, ...submitData })
    } else {
      createContact(submitData)
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
        notes: '',
        status: 'novo',
        channel: undefined,
        source: '',
        agent_assigned: '',
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
      <DialogContent className="bg-abba-black border-abba-gray max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-abba-text">
            {contact ? 'Editar Contato' : 'Novo Contato'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {contact ? 'Atualize as informações do contato' : 'Adicione um novo contato ao seu sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-abba-text">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-abba-text">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-abba-text">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
                placeholder="+55 11 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-abba-text">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
                placeholder="@usuario"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company" className="text-abba-text">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position" className="text-abba-text">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-abba-text">Status</Label>
              <Select value={formData.status} onValueChange={(value: Contact['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text">
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
              <Label htmlFor="channel" className="text-abba-text">Canal</Label>
              <Select value={formData.channel || ''} onValueChange={(value: Contact['channel']) => setFormData(prev => ({ ...prev, channel: value }))}>
                <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text">
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
              <Label htmlFor="source" className="text-abba-text">Fonte</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
                placeholder="Stories, Post, Bio Link, etc."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="agent" className="text-abba-text">Agente Responsável</Label>
              <Input
                id="agent"
                value={formData.agent_assigned}
                onChange={(e) => setFormData(prev => ({ ...prev, agent_assigned: e.target.value }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value" className="text-abba-text">Valor Estimado (R$)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                className="bg-abba-gray border-abba-gray text-abba-text"
                placeholder="0,00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-abba-text">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="bg-abba-gray border-abba-gray text-abba-text"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-abba-text">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-abba-gray border-abba-gray text-abba-text min-h-[100px]"
              placeholder="Adicione observações sobre o contato..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-abba-gray text-abba-text hover:bg-abba-gray"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating}
              className="bg-abba-green text-abba-black hover:bg-abba-green-light"
            >
              {contact ? 'Atualizar' : 'Criar'} Contato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
