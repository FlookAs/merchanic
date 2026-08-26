import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '@/components/shared/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuotes } from '@/hooks/useQuotes'
import type { QuoteStatus } from '@/types'
import { useState } from 'react'

const STATUS_OPTIONS: { value: QuoteStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'ทุกสถานะ' },
  { value: 'NEW', label: 'ใหม่' },
  { value: 'REVIEWING', label: 'กำลังตรวจสอบ' },
  { value: 'ADJUSTED', label: 'ปรับราคาแล้ว' },
  { value: 'QUOTED', label: 'ออกใบเสนอราคาแล้ว' },
  { value: 'CLOSED', label: 'ปิดงาน' },
]

export default function QuotesListPage() {
  const { data: quotes, isLoading } = useQuotes()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<QuoteStatus | 'ALL'>('ALL')

  const filtered = filter === 'ALL' ? (quotes ?? []) : (quotes ?? []).filter((q) => q.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">รายการคำขอใบเสนอราคา</h1>
        <Select value={filter} onValueChange={(v) => setFilter(v as QuoteStatus | 'ALL')}>
          <SelectTrigger className="w-44 bg-card-bg border-steel text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card-bg border-steel text-white">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="focus:bg-navy-light">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card-bg rounded-lg border border-steel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-steel hover:bg-transparent">
              <TableHead className="text-gray-400">วันที่</TableHead>
              <TableHead className="text-gray-400">ชื่อลูกค้า</TableHead>
              <TableHead className="text-gray-400">บริษัท</TableHead>
              <TableHead className="text-gray-400">สถานะ</TableHead>
              <TableHead className="text-gray-400">ผู้รับผิดชอบ</TableHead>
              <TableHead className="text-gray-400 text-right">ยอดรวม</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-steel">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 bg-body-bg" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow className="border-steel">
                <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                  ไม่มีรายการ
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((q) => (
                <TableRow
                  key={q.id}
                  className="border-steel hover:bg-navy-light cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/quotes/${q.id}`)}
                >
                  <TableCell className="text-gray-300 text-sm">
                    {format(new Date(q.createdAt), 'd MMM yy', { locale: th })}
                  </TableCell>
                  <TableCell className="text-white font-medium">{q.customerName}</TableCell>
                  <TableCell className="text-gray-400">{q.company ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={q.status} /></TableCell>
                  <TableCell className="text-gray-400">{q.assignedTo?.email ?? '—'}</TableCell>
                  <TableCell className="text-white text-right font-mono text-sm">
                    {Number(q.finalTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
