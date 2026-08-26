import { CheckCircle, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createQuote } from '@/lib/api/quotes'
import { useCartStore } from '@/store/cartStore'
import { formatTHB } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ContactFormValues } from './StepContactForm'

interface StepConfirmationProps {
  contact: ContactFormValues
  onBack: () => void
}

export default function StepConfirmation({ contact, onBack }: StepConfirmationProps) {
  const { items, clearCart } = useCartStore()
  const [submitting, setSubmitting] = useState(false)
  const [quoteId, setQuoteId] = useState<string | null>(null)

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.unitPriceSnapshot) * i.quantity,
    0,
  )
  const vat = subtotal * 0.07
  const total = subtotal + vat

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const result = await createQuote({
        ...contact,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      })
      setQuoteId(result.id)
      clearCart()
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  if (quoteId) {
    const confirmationUrl = `${import.meta.env.VITE_R2_BASE_URL}/confirmations/${quoteId}.pdf`
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold mb-2">ส่งคำขอสำเร็จ!</h2>
        <p className="text-gray-400 mb-1">
          ทีมงานได้รับคำขอของคุณแล้ว จะติดต่อกลับภายใน 1-2 วันทำการ
        </p>
        <p className="text-gray-500 text-sm mb-6">
          หมายเลขอ้างอิง: <span className="text-white font-mono">{quoteId.slice(0, 8).toUpperCase()}</span>
        </p>
        <a href={confirmationUrl} target="_blank" rel="noopener noreferrer">
          <button className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm">
            <Download className="w-4 h-4" />
            ดาวน์โหลดใบยืนยันคำขอ
          </button>
        </a>
        <p className="text-gray-600 text-xs mt-3">ไฟล์อาจใช้เวลาสักครู่ในการเตรียม กรุณารอสักครู่แล้วลองใหม่</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-white font-semibold mb-6">ยืนยันคำขอใบเสนอราคา</h2>

      {/* Contact summary */}
      <Card className="bg-card-bg border-steel mb-4">
        <CardContent className="p-4 text-sm space-y-1">
          <p className="text-gray-400 font-medium mb-2">ข้อมูลติดต่อ</p>
          <p className="text-white">{contact.customerName} {contact.company && `(${contact.company})`}</p>
          <p className="text-gray-400">{contact.email} · {contact.phone}</p>
          {contact.message && <p className="text-gray-400 mt-1">{contact.message}</p>}
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="bg-card-bg border-steel mb-4">
        <CardContent className="p-4">
          <p className="text-gray-400 font-medium text-sm mb-3">รายการสินค้า</p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-300">{item.name} ×{item.quantity} {item.unit}</span>
                <span className="text-white">{formatTHB(Number(item.unitPriceSnapshot) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator className="bg-steel my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>ยอดก่อน VAT</span>
              <span>{formatTHB(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>VAT 7%</span>
              <span>{formatTHB(vat)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-base pt-1">
              <span>รวมทั้งสิ้น</span>
              <span className="text-orange">{formatTHB(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-steel text-gray-300 hover:bg-card-bg"
          onClick={onBack}
          disabled={submitting}
        >
          ← ย้อนกลับ
        </Button>
        <Button
          className="flex-1 bg-orange hover:bg-orange-dark text-white"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> กำลังส่ง...</>
          ) : 'ยืนยันและส่งคำขอ'}
        </Button>
      </div>
    </div>
  )
}
