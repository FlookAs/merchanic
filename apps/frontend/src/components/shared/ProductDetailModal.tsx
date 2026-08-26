import { ImageIcon, Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cartStore'
import { formatTHB } from '@/lib/utils'
import type { Product } from '@/types'

const R2 = import.meta.env.VITE_R2_BASE_URL ?? ''

function ModalContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const items = useCartStore((s) => s.items)
  const setItemQty = useCartStore((s) => s.setItemQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const inCart = items.find((i) => i.productId === product.id)
  const [qty, setQty] = useState(inCart?.quantity ?? 1)
  const [activeIdx, setActiveIdx] = useState(0)
  const images = product.imageKeys
  const activeKey = images[activeIdx] ?? null

  const handleAdd = () => {
    setItemQty(product, qty)
    toast.success(
      inCart
        ? `อัปเดต "${product.name}" เป็น ${qty} ${product.unit}`
        : `เพิ่ม "${product.name}" จำนวน ${qty} ${product.unit}`,
    )
    onClose()
  }

  const handleRemove = () => {
    removeItem(product.id)
    toast.success(`นำ "${product.name}" ออกแล้ว`)
    onClose()
  }

  return (
    <DialogContent className="bg-card-bg border-steel text-white max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
      {/* รูปภาพ — fixed ไม่เลื่อน */}
      <div className="shrink-0">
        {activeKey ? (
          <img src={`${R2}/${activeKey}`} alt={product.name} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-body-bg flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-2 bg-black/30 overflow-x-auto">
            {images.map((key, i) => (
              <button
                key={key}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                  i === activeIdx ? 'border-orange' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={`${R2}/${key}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* content เลื่อนได้ */}
      <div className="overflow-y-auto flex-1">
      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-white font-bold text-lg leading-snug">{product.name}</h2>
          <p className="text-orange font-bold text-xl mt-1">
            {formatTHB(product.unitPrice)}
            <span className="text-gray-400 text-sm font-normal"> / {product.unit}</span>
          </p>
        </div>

        {product.description && (
          <p className="text-gray-300 text-sm leading-relaxed break-all">{product.description}</p>
        )}

        <Separator className="bg-steel" />

        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">จำนวน</span>
          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 rounded bg-steel flex items-center justify-center text-white hover:bg-orange transition-colors"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-white font-bold w-8 text-center">{qty}</span>
            <button
              className="w-8 h-8 rounded bg-steel flex items-center justify-center text-white hover:bg-orange transition-colors"
              onClick={() => setQty((q) => q + 1)}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-400">
          <span>ยอดรวม</span>
          <span className="text-white font-bold">{formatTHB(Number(product.unitPrice) * qty)}</span>
        </div>

        <div className="flex gap-2 pt-1">
          {inCart && (
            <Button
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-900/40"
              onClick={handleRemove}
            >
              <Trash2 className="w-4 h-4 mr-1" /> นำออก
            </Button>
          )}
          <Button className="flex-1 bg-orange hover:bg-orange-dark text-white" onClick={handleAdd}>
            {inCart ? 'อัปเดตจำนวน' : 'เพิ่มในคำขอ'}
          </Button>
        </div>
      </div>
      </div>
    </DialogContent>
  )
}

export function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!product} onOpenChange={(open) => { if (!open) onClose() }}>
      {product && <ModalContent product={product} onClose={onClose} />}
    </Dialog>
  )
}
