
import { ContactWithTags } from './useContacts'

export const useContactExport = () => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR')
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

  const exportToCSV = (contacts: ContactWithTags[]) => {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Instagram',
      'Empresa',
      'Cargo',
      'Endereço',
      'Status',
      'Canal',
      'Tags',
      'Agente',
      'Último Contato',
      'Data de Criação'
    ]

    const csvContent = [
      headers.join(','),
      ...contacts.map(contact => [
        `"${contact.name}"`,
        `"${contact.email || ''}"`,
        `"${contact.phone || ''}"`,
        `"${contact.instagram || ''}"`,
        `"${contact.company || ''}"`,
        `"${contact.position || ''}"`,
        `"${contact.address || ''}"`,
        `"${getStatusLabel(contact.status)}"`,
        `"${getChannelLabel(contact.channel)}"`,
        `"${contact.tags?.map(tag => tag.name).join('; ') || ''}"`,
        `"${contact.agent_assigned || ''}"`,
        `"${formatDate(contact.last_contact_date)}"`,
        `"${formatDate(contact.created_at)}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `contatos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    exportToCSV
  }
}
