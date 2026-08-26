import { ImageIcon, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductDetailModal } from '@/components/shared/ProductDetailModal'
import { useProducts } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { formatTHB } from '@/lib/utils'
import type { Product } from '@/types'

function ProductRow({ product, onClick }: { product: Product; onClick: () => void }) {
  const inCart = useCartStore((s) => s.items.find((i) => i.productId === product.id))

  return (
    <div
      className="flex items-center gap-4 py-3 border-b border-steel last:border-0 cursor-pointer hover:bg-navy-light/50 -mx-4 px-4 transition-colors rounded"
      onClick={onClick}
    >
      {product.imageKeys?.[0] ? (
        <img
          src={`${import.meta.env.VITE_R2_BASE_URL}/${product.imageKeys[0]}`}
          alt={product.name}
          className="w-12 h-12 rounded object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded bg-body-bg flex items-center justify-center shrink-0">
          <ImageIcon className="w-5 h-5 text-gray-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{product.name}</p>
        <p className="text-gray-400 text-xs">{formatTHB(product.unitPrice)} / {product.unit}</p>
      </div>
      {inCart ? (
        <span className="text-orange text-xs font-medium shrink-0 bg-orange/10 px-2 py-1 rounded">
          ×{inCart.quantity} ในคำขอ
        </span>
      ) : (
        <span className="text-gray-500 text-xs shrink-0">คลิกดูรายละเอียด</span>
      )}
    </div>
  )
}

export default function StepProductSelect({ onNext }: { onNext: () => void }) {
  const { data: products, isLoading } = useProducts(false)
  const items = useCartStore((s) => s.items)
  const setItemQty = useCartStore((s) => s.setItemQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const [selected, setSelected] = useState<Product | null>(null)

  const cartTotal = items.reduce(
    (sum, i) => sum + Number(i.unitPriceSnapshot) * i.quantity,
    0,
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product list */}
      <div className="lg:col-span-2">
        <h2 className="text-white font-semibold mb-4">เลือกสินค้า / บริการ</h2>
        <Card className="bg-card-bg border-steel">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 bg-body-bg" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              products.map((p) => (
                <ProductRow key={p.id} product={p} onClick={() => setSelected(p)} />
              ))
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">ยังไม่มีสินค้า</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart summary */}
      <div>
        <h2 className="text-white font-semibold mb-4">รายการที่เลือก</h2>
        <Card className="bg-card-bg border-steel sticky top-20">
          <CardContent className="p-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">ยังไม่ได้เลือกสินค้า</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-300 truncate flex-1">{item.name} ×{item.quantity}</span>
                    <span className="text-white shrink-0">
                      {formatTHB(Number(item.unitPriceSnapshot) * item.quantity)}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="w-5 h-5 rounded bg-steel flex items-center justify-center text-white hover:bg-orange transition-colors"
                        onClick={() => {
                          const product = products?.find((p) => p.id === item.productId)
                          if (product) setItemQty(product, item.quantity - 1)
                        }}
                      >
                        <Minus className="w-2 h-2" />
                      </button>
                      <button
                        className="w-5 h-5 rounded bg-steel flex items-center justify-center text-white hover:bg-orange transition-colors"
                        onClick={() => {
                          const product = products?.find((p) => p.id === item.productId)
                          if (product) setItemQty(product, item.quantity + 1)
                        }}
                      >
                        <Plus className="w-2 h-2" />
                      </button>
                      <button
                        className="w-5 h-5 rounded bg-red-900/50 flex items-center justify-center text-red-400 hover:bg-red-800 transition-colors"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="w-2 h-2" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Separator className="bg-steel my-3" />
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-400">ยอดรวม (ก่อน VAT)</span>
              <span className="text-orange font-bold">{formatTHB(cartTotal)}</span>
            </div>
            <Button
              className="w-full bg-orange hover:bg-orange-dark text-white"
              disabled={items.length === 0}
              onClick={onNext}
            >
              ถัดไป: กรอกข้อมูลติดต่อ →
            </Button>
          </CardContent>
        </Card>
      </div>

      <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
