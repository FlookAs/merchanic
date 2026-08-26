import {
  Droplets, Flame, Gauge, Settings, Shield, Thermometer, Wrench, Zap,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Droplets', icon: Droplets },
  { name: 'Shield', icon: Shield },
  { name: 'Wrench', icon: Wrench },
  { name: 'Flame', icon: Flame },
  { name: 'Zap', icon: Zap },
  { name: 'Gauge', icon: Gauge },
  { name: 'Settings', icon: Settings },
  { name: 'Thermometer', icon: Thermometer },
]

export function resolveIcon(name: string | null | undefined): LucideIcon {
  return ICON_OPTIONS.find((o) => o.name === name)?.icon ?? Wrench
}

interface Props {
  value: string
  onChange: (name: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_OPTIONS.map(({ name, icon: Icon }) => (
        <Button
          key={name}
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange(name)}
          className={`h-10 w-10 p-0 rounded-md border ${
            value === name
              ? 'border-orange bg-orange/10 text-orange'
              : 'border-steel text-gray-400 hover:text-white hover:border-gray-400'
          }`}
          title={name}
        >
          <Icon className="w-5 h-5" />
        </Button>
      ))}
    </div>
  )
}
