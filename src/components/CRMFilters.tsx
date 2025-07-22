
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CRMFiltersProps {
  showFilters: boolean
  filterAgent: string
  filterChannel: string
  filterTag: string
  allAgents: string[]
  allChannels: string[]
  allTags: string[]
  setFilterAgent: (value: string) => void
  setFilterChannel: (value: string) => void
  setFilterTag: (value: string) => void
}

export const CRMFilters = ({
  showFilters,
  filterAgent,
  filterChannel,
  filterTag,
  allAgents,
  allChannels,
  allTags,
  setFilterAgent,
  setFilterChannel,
  setFilterTag,
}: CRMFiltersProps) => {
  if (!showFilters) return null

  return (
    <Card className="bg-abba-black border-abba-gray">
      <CardHeader>
        <CardTitle className="text-abba-text">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          <Select value={filterAgent || 'all_agents'} onValueChange={(value) => setFilterAgent(value === 'all_agents' ? '' : value)}>
            <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
              <SelectValue placeholder="Agente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_agents">Todos os agentes</SelectItem>
              {allAgents.map((agent) => (
                <SelectItem key={agent} value={agent}>
                  {agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterChannel || 'all_channels'} onValueChange={(value) => setFilterChannel(value === 'all_channels' ? '' : value)}>
            <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_channels">Todos os canais</SelectItem>
              {allChannels.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterTag || 'all_tags'} onValueChange={(value) => setFilterTag(value === 'all_tags' ? '' : value)}>
            <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_tags">Todas as tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => {
              setFilterAgent("")
              setFilterChannel("")
              setFilterTag("")
            }}
            variant="outline"
            className="border-abba-gray text-abba-text"
          >
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
