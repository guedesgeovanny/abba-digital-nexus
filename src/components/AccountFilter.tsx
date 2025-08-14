import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAccountFilter } from "@/hooks/useAccountFilter"

interface AccountFilterProps {
  selectedAccount: string
  onAccountChange: (account: string) => void
}

export const AccountFilter = ({ selectedAccount, onAccountChange }: AccountFilterProps) => {
  const { accounts, isLoading } = useAccountFilter()

  if (isLoading) {
    return (
      <div className="w-40">
      <Select disabled>
        <SelectTrigger className="bg-background border-border text-foreground">
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
      </div>
    )
  }

  return (
    <div className="w-40">
    <Select value={selectedAccount} onValueChange={onAccountChange}>
      <SelectTrigger className="bg-background border-border text-foreground focus:border-abba-green">
        <SelectValue placeholder="Todas as contas" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        <SelectItem value="all" className="text-foreground focus:bg-abba-green focus:text-abba-black">
          Todas as contas
        </SelectItem>
        {accounts.map((account) => (
          <SelectItem 
            key={account.value} 
            value={account.value}
            className="text-foreground focus:bg-abba-green focus:text-abba-black"
          >
            {account.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    </div>
  )
}