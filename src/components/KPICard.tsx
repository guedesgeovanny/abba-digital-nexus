
import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export function KPICard({ title, value, icon: Icon, trend, description }: KPICardProps) {
  return (
    <Card className="bg-abba-black border-abba-gray hover:border-abba-green transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-abba-text">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-abba-green" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-abba-green">
          {value}
        </div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% desde o último mês
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
