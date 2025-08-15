import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DashboardDateFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export function DashboardDateFilter({ dateRange, onDateRangeChange }: DashboardDateFilterProps) {
  const [isFromOpen, setIsFromOpen] = useState(false)
  const [isToOpen, setIsToOpen] = useState(false)

  const handleFromDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, from: date })
    setIsFromOpen(false)
  }

  const handleToDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, to: date })
    setIsToOpen(false)
  }

  const clearFilters = () => {
    onDateRangeChange({ from: undefined, to: undefined })
  }

  const setPresetRange = (days: number) => {
    const today = new Date()
    const from = new Date()
    from.setDate(today.getDate() - days)
    onDateRangeChange({ from, to: today })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-card/50 rounded border-0">
      {/* Quick preset buttons */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPresetRange(6)}
          className="text-xs px-2 h-7"
        >
          7d
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPresetRange(29)}
          className="text-xs px-2 h-7"
        >
          30d
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPresetRange(89)}
          className="text-xs px-2 h-7"
        >
          90d
        </Button>
      </div>

      {/* From Date */}
      <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-[120px] justify-start text-left font-normal h-7 text-xs",
              !dateRange.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {dateRange.from ? (
              format(dateRange.from, "dd/MM", { locale: ptBR })
            ) : (
              <span>Início</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.from}
            onSelect={handleFromDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* To Date */}
      <Popover open={isToOpen} onOpenChange={setIsToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-[120px] justify-start text-left font-normal h-7 text-xs",
              !dateRange.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {dateRange.to ? (
              format(dateRange.to, "dd/MM", { locale: ptBR })
            ) : (
              <span>Fim</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.to}
            onSelect={handleToDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
            disabled={(date) => 
              dateRange.from ? date < dateRange.from : false
            }
          />
        </PopoverContent>
      </Popover>

      {/* Clear button */}
      {(dateRange.from || dateRange.to) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs px-2 h-7 text-muted-foreground hover:text-foreground"
        >
          ×
        </Button>
      )}
    </div>
  )
}