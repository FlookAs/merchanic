import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { ArrowLeft, Download, FileText, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import StatusBadge from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdjustItemPrice, useDeleteDocument, useGenerateDocument, useQuote, useUpdateQuoteStatus } from '@/hooks/useQuotes'
import { useAuthStore } from '@/store/authStore'
import type { QuoteStatus } from '@/types'
import { formatTHB } from '@/lib/utils'

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'NEW', label: 'ใหม่' },
  { value: 'REVIEWING', label: 'กำลังตรวจสอบ' },
  { value: 'ADJUSTED', label: 'ปรับราคาแล้ว' },
  { value: 'QUOTED', label: 'ออกใบเสนอราคาแล้ว' },
  { value: 'CLOSED', label: 'ปิดงาน' },
]

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: quote, isLoading } = useQuote(id!)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'

  const updateStatus = useUpdateQuoteStatus()
  const adjustPrice = useAdjustItemPrice()
  const generateDoc = useGenerateDocument()
  const deleteDoc = useDeleteDocument(id!)

  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [priceInput, setPriceInput] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 bg-card-bg" />
        <Skeleton className="h-48 bg-card-bg" />
        <Skeleton className="h-64 bg-card-bg" />
      </div>
    )
  }
  if (!quote) return <p className="text-gray-400">ไม่พบข้อมูล</p>

  const handleSavePrice = (itemId: string) => {
    const price = parseFloat(priceInput)
    if (isNaN(price) || price < 0) {
      toast.error('กรุณากรอกราคาที่ถูกต้อง')
      return
    }
    adjustPrice.mutate(
      { quoteId: id!, itemId, price },
      {
        onSuccess: () => {
          toast.success('บันทึกราคาแล้ว')
          setEditingItem(null)
          setPriceInput('')
        },
        onError: () => toast.error('บันทึกราคาไม่สำเร็จ'),
      },
    )
  }

  const handleGeneratePDF = () => {
    generateDoc.mutate(id!, {
      onSuccess: () => toast.success('สร้างใบเสนอราคาสำเร็จ'),
      onError: () => toast.error('สร้าง PDF ไม่สำเร็จ ลองใหม่อีกครั้ง'),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/quotes">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
            <ArrowLeft className="w-4 h-4" /> กลับ
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-white flex-1">คำขอ #{quote.id.slice(0, 8).toUpperCase()}</h1>
        <StatusBadge status={quote.status} />
      </div>

      {/* Customer info + Status control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card-bg border-steel">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">ข้อมูลลูกค้า</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-white font-medium">{quote.customerName}</p>
            {quote.company && <p className="text-gray-400">{quote.company}</p>}
            <p className="text-gray-400">{quote.email} · {quote.phone}</p>
            {quote.message && <p className="text-gray-300 mt-2 border-t border-steel pt-2">{quote.message}</p>}
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-steel">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">จัดการสถานะ</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={quote.status}
              onValueChange={(v) =>
                updateStatus.mutate(
                  { id: id!, status: v as QuoteStatus },
                  { onSuccess: () => toast.success('อัปเดตสถานะแล้ว'), onError: () => toast.error('อัปเดตสถานะไม่สำเร็จ') },
                )
              }
            >
              <SelectTrigger className="bg-body-bg border-steel text-white">
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
            {isAdmin && (
              <Button
                className="w-full bg-orange hover:bg-orange-dark text-white gap-2"
                onClick={handleGeneratePDF}
                disabled={generateDoc.isPending}
              >
                {generateDoc.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />กำลังสร้าง PDF...</>
                ) : (
                  <><FileText className="w-4 h-4" />สร้างใบเสนอราคา PDF</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card className="bg-card-bg border-steel">
        <CardHeader className="pb-2"><CardTitle className="text-white text-sm">รายการสินค้า</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-steel hover:bg-transparent">
                <TableHead className="text-gray-400">รายการ</TableHead>
                <TableHead className="text-gray-400 text-center">จำนวน</TableHead>
                <TableHead className="text-gray-400 text-right">ราคาต่อหน่วย</TableHead>
                {isAdmin && <TableHead className="text-gray-400 text-right">ราคาปรับ</TableHead>}
                <TableHead className="text-gray-400 text-right">รวม</TableHead>
                {isAdmin && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item) => {
                const effectivePrice = item.adjustedUnitPrice ?? item.unitPriceSnapshot
                const lineTotal = Number(effectivePrice) * item.quantity
                const isEditing = editingItem === item.id

                return (
                  <TableRow key={item.id} className="border-steel hover:bg-navy-light">
                    <TableCell className="text-white">{item.product?.name ?? item.productId}</TableCell>
                    <TableCell className="text-gray-300 text-center">{item.quantity} {item.product?.unit}</TableCell>
                    <TableCell className="text-gray-400 text-right font-mono text-sm">
                      {formatTHB(item.unitPriceSnapshot)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Input
                              type="number"
                              value={priceInput}
                              onChange={(e) => setPriceInput(e.target.value)}
                              className="w-28 bg-body-bg border-steel text-white text-sm h-7 text-right"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              className="h-7 bg-orange hover:bg-orange-dark text-white text-xs"
                              onClick={() => handleSavePrice(item.id)}
                              disabled={adjustPrice.isPending}
                            >
                              บันทึก
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-gray-400 text-xs"
                              onClick={() => { setEditingItem(null); setPriceInput('') }}
                            >
                              ยกเลิก
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-sm cursor-pointer rounded px-2 py-0.5 transition-colors ${
                              item.adjustedUnitPrice
                                ? 'text-orange bg-orange/10 hover:bg-orange/20'
                                : 'text-gray-300 bg-steel/40 hover:bg-orange/20 hover:text-orange border border-dashed border-steel'
                            }`}
                            onClick={() => {
                              setEditingItem(item.id)
                              setPriceInput(item.adjustedUnitPrice ?? item.unitPriceSnapshot)
                            }}
                          >
                            {item.adjustedUnitPrice ? formatTHB(item.adjustedUnitPrice) : '✎ ปรับราคา'}
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-white text-right font-mono text-sm">{formatTHB(lineTotal)}</TableCell>
                    {isAdmin && <TableCell />}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t border-steel space-y-1">
          <div className="flex justify-between text-sm text-gray-400">
            <span>ยอดก่อน VAT</span><span>{formatTHB(quote.autoTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>VAT {Number(quote.taxRate)}%</span>
            <span>{formatTHB(Number(quote.autoTotal) * Number(quote.taxRate) / 100)}</span>
          </div>
          {Number(quote.discountAmount) > 0 && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>ส่วนลด</span><span>-{formatTHB(quote.discountAmount)}</span>
            </div>
          )}
          <Separator className="bg-steel my-2" />
          <div className="flex justify-between text-white font-bold text-base">
            <span>รวมทั้งสิ้น</span>
            <span className="text-orange">{formatTHB(quote.finalTotal)}</span>
          </div>
        </div>
      </Card>

      {/* Quote documents */}
      {quote.quoteDocuments.length > 0 && (
        <Card className="bg-card-bg border-steel">
          <CardHeader className="pb-2"><CardTitle className="text-white text-sm">ใบเสนอราคาที่ออกแล้ว</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-steel hover:bg-transparent">
                  <TableHead className="text-gray-400">เลขที่</TableHead>
                  <TableHead className="text-gray-400">วันที่ออก</TableHead>
                  <TableHead className="text-gray-400 text-right">ยอดรวม</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.quoteDocuments.map((doc) => (
                  <TableRow key={doc.id} className="border-steel hover:bg-navy-light">
                    <TableCell className="text-white font-mono text-sm">{doc.documentNumber}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {format(new Date(doc.issuedAt), 'd MMM yyyy', { locale: th })}
                    </TableCell>
                    <TableCell className="text-orange text-right font-bold font-mono text-sm">
                      {formatTHB(doc.grandTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`${import.meta.env.VITE_R2_BASE_URL}/${doc.pdfKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="ghost" className="h-7 text-gray-400 hover:text-white gap-1 text-xs">
                            <Download className="w-3 h-3" /> ดาวน์โหลด
                          </Button>
                        </a>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            disabled={deleteDoc.isPending}
                            onClick={() => {
                              if (confirm(`ลบใบเสนอราคา ${doc.documentNumber} ออกจากระบบ?`)) {
                                deleteDoc.mutate(doc.id, {
                                  onSuccess: () => toast.success('ลบใบเสนอราคาสำเร็จ'),
                                  onError: () => toast.error('ลบไม่สำเร็จ ลองใหม่อีกครั้ง'),
                                })
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
