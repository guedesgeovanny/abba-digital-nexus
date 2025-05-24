
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

  const exportToPDF = (contacts: ContactWithTags[]) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(18)
    doc.text('Relatório de Contatos', 14, 22)
    
    doc.setFontSize(11)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30)
    doc.text(`Total de contatos: ${contacts.length}`, 14, 36)

    // Table data
    const tableData = contacts.map(contact => [
      contact.name,
      contact.email || '-',
      contact.phone || '-',
      contact.company || '-',
      getStatusLabel(contact.status),
      getChannelLabel(contact.channel),
      contact.tags?.map(tag => tag.name).join(', ') || '-',
      formatDate(contact.last_contact_date)
    ])

    autoTable(doc, {
      head: [['Nome', 'Email', 'Telefone', 'Empresa', 'Status', 'Canal', 'Tags', 'Último Contato']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 45, left: 14, right: 14 }
    })

    doc.save(`contatos_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return {
    exportToCSV,
    exportToPDF
  }
}
