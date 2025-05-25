
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Option {
  value: string
  label: string
}

interface AgentFormFieldProps {
  label: string
  type: 'input' | 'textarea' | 'select'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  options?: Option[]
  rows?: number
}

export const AgentFormField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  rows = 3
}: AgentFormFieldProps) => {
  const renderField = () => {
    switch (type) {
      case 'input':
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-abba-gray border-abba-gray text-abba-text"
            required={required}
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-abba-gray border-abba-gray text-abba-text"
            rows={rows}
          />
        )
      case 'select':
        return (
          <Select value={value} onValueChange={onChange} required={required}>
            <SelectTrigger className="bg-abba-gray border-abba-gray text-abba-text">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-abba-text mb-2 block">
        {label}
      </label>
      {renderField()}
    </div>
  )
}
