
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testN8nWebhook } from '@/services/webhookTestService'
import { toast } from "sonner"

export const WebhookTester = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    conversation_id: '',
    content: '',
    direction: 'received' as 'sent' | 'received',
    message_type: 'text' as 'text' | 'image' | 'audio' | 'document' | 'file',
    sender_name: '',
    contact_name: '',
    contact_phone: '',
    contact_username: ''
  })

  const handleTest = async () => {
    if (!formData.conversation_id || !formData.content) {
      toast.error('ID da conversa e conteúdo são obrigatórios')
      return
    }

    try {
      setIsLoading(true)
      await testN8nWebhook(formData)
      toast.success('Webhook executado com sucesso!')
    } catch (error) {
      console.error('Erro no teste:', error)
      toast.error(`Erro: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste do Webhook N8N</CardTitle>
        <CardDescription>
          Teste a integração do webhook para receber mensagens do n8n
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="conversation_id">ID da Conversa (UUID) *</Label>
          <Input
            id="conversation_id"
            value={formData.conversation_id}
            onChange={(e) => setFormData({ ...formData, conversation_id: e.target.value })}
            placeholder="UUID da conversa existente"
          />
        </div>

        <div>
          <Label htmlFor="content">Conteúdo da Mensagem *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Conteúdo da mensagem"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="direction">Direção</Label>
            <select
              id="direction"
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'sent' | 'received' })}
              className="w-full p-2 border rounded"
            >
              <option value="received">Recebida</option>
              <option value="sent">Enviada</option>
            </select>
          </div>

          <div>
            <Label htmlFor="message_type">Tipo da Mensagem</Label>
            <select
              id="message_type"
              value={formData.message_type}
              onChange={(e) => setFormData({ ...formData, message_type: e.target.value as any })}
              className="w-full p-2 border rounded"
            >
              <option value="text">Texto</option>
              <option value="image">Imagem</option>
              <option value="audio">Áudio</option>
              <option value="document">Documento</option>
              <option value="file">Arquivo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sender_name">Nome do Remetente</Label>
            <Input
              id="sender_name"
              value={formData.sender_name}
              onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
              placeholder="Nome do remetente"
            />
          </div>

          <div>
            <Label htmlFor="contact_name">Nome do Contato</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="Nome do contato"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_phone">Telefone do Contato</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+5511999998888"
            />
          </div>

          <div>
            <Label htmlFor="contact_username">Username do Contato</Label>
            <Input
              id="contact_username"
              value={formData.contact_username}
              onChange={(e) => setFormData({ ...formData, contact_username: e.target.value })}
              placeholder="@username"
            />
          </div>
        </div>

        <Button 
          onClick={handleTest} 
          disabled={isLoading || !formData.conversation_id || !formData.content}
          className="w-full"
        >
          {isLoading ? 'Testando...' : 'Testar Webhook'}
        </Button>

        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <strong>URL do Webhook:</strong><br />
          <code>https://vlarijlhllzjqvxdigds.supabase.co/functions/v1/n8n-webhook</code>
        </div>
      </CardContent>
    </Card>
  )
}
