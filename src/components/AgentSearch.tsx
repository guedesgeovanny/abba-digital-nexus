
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface AgentSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export const AgentSearch = ({ searchTerm, onSearchChange }: AgentSearchProps) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar agentes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
        />
      </div>
    </div>
  )
}
