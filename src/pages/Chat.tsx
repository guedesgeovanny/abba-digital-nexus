
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import { ConversationList } from "@/components/ConversationList"
import { ChatArea } from "@/components/ChatArea"

// Dados ilustrativos para as conversas
const mockConversations = [
  {
    id: 1,
    name: "Maryjane Guedes | Modelo Plus Size",
    username: "marypguedes",
    lastMessage: "Maryjane enviou um anexo",
    time: "13 h",
    avatar: "/lovable-uploads/570c9d08-209d-4434-84a8-b9937859bc5e.png",
    status: "geral",
    unread: false,
    isActive: true
  },
  {
    id: 2,
    name: "Eduardo Martins",
    username: "eduardo.martins",
    lastMessage: "Obrigado pelo atendimento!",
    time: "agora",
    avatar: "/placeholder.svg",
    status: "aberto",
    unread: true,
    isOnline: true,
    isActive: false
  },
  {
    id: 3,
    name: "Antonio Neto",
    username: "antonio.neto",
    lastMessage: "Quando posso agendar?",
    time: "há 18 min",
    avatar: "/placeholder.svg",
    status: "aberto",
    unread: false,
    isActive: false
  },
  {
    id: 4,
    name: "Marcelo Maia",
    username: "marcelo.maia",
    lastMessage: "Você: 😄😄",
    time: "1 d",
    avatar: "/placeholder.svg",
    status: "fechado",
    unread: false,
    isActive: false
  },
  {
    id: 5,
    name: "Thays Campos",
    username: "thays.campos",
    lastMessage: "Perfeito, obrigada!",
    time: "há 1 min",
    avatar: "/placeholder.svg",
    status: "aberto",
    unread: true,
    isOnline: true,
    isActive: false
  },
  {
    id: 6,
    name: "Caio Alves",
    username: "caio.alves",
    lastMessage: "Preciso de mais informações",
    time: "há 1 min",
    avatar: "/placeholder.svg",
    status: "aberto",
    unread: false,
    isOnline: true,
    isActive: false
  },
  {
    id: 7,
    name: "Rubenvaldo Guedes Guedes",
    username: "rubenvaldo.guedes",
    lastMessage: "Vou pensar sobre a proposta",
    time: "há 3 h",
    avatar: "/placeholder.svg",
    status: "geral",
    unread: false,
    isActive: false
  },
  {
    id: 8,
    name: "Thiago Nascimento",
    username: "thiago.nascimento",
    lastMessage: "não acho por nada",
    time: "6 d",
    avatar: "/placeholder.svg",
    status: "fechado",
    unread: false,
    isActive: false
  }
]

const Chat = () => {
  const [activeTab, setActiveTab] = useState("geral")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])

  const filteredConversations = mockConversations.filter(conversation => {
    const matchesSearch = conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.username.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "geral") return matchesSearch
    if (activeTab === "aberto") return matchesSearch && conversation.status === "aberto"
    if (activeTab === "fechado") return matchesSearch && conversation.status === "fechado"
    
    return matchesSearch
  })

  return (
    <div className="h-full bg-abba-black text-abba-text">
      <div className="flex h-full">
        {/* Sidebar de conversas */}
        <div className="w-96 bg-abba-black border-r border-abba-gray flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-abba-gray">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-abba-text">Chat</h2>
            </div>
            
            {/* Campo de busca */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-abba-gray">
                <TabsTrigger 
                  value="geral" 
                  className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="aberto"
                  className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Em Aberto
                </TabsTrigger>
                <TabsTrigger 
                  value="fechado"
                  className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black"
                >
                  Fechadas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Lista de conversas */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList 
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          </div>
        </div>

        {/* Área do chat */}
        <div className="flex-1 flex flex-col">
          <ChatArea conversation={selectedConversation} />
        </div>
      </div>
    </div>
  )
}

export default Chat
