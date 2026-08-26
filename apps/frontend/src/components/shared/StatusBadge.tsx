import { Badge } from '@/components/ui/badge'
import type { QuoteStatus } from '@/types'

const STATUS_CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
  NEW: { label: 'ใหม่', className: 'bg-orange text-white hover:bg-orange-dark' },
  REVIEWING: { label: 'กำลังตรวจสอบ', className: 'bg-blue-600 text-white hover:bg-blue-700' },
  ADJUSTED: { label: 'ปรับราคาแล้ว', className: 'bg-yellow-500 text-black hover:bg-yellow-600' },
  QUOTED: { label: 'ออกใบเสนอราคาแล้ว', className: 'bg-green-600 text-white hover:bg-green-700' },
  CLOSED: { label: 'ปิดงาน', className: 'bg-steel text-white hover:bg-steel' },
}

export default function StatusBadge({ status }: { status: QuoteStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
