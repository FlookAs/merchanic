import { useState } from 'react'
import ImageDisplay from '@/components/shared/ImageDisplay'
import { ProductDetailModal } from '@/components/shared/ProductDetailModal'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types'
import { formatTHB } from '@/lib/utils'

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const inCart = useCartStore((s) => s.items.find((i) => i.productId === product.id))

  return (
    <div
      className="bg-card-bg border border-steel rounded-lg flex flex-col cursor-pointer hover:border-orange transition-colors group"
      onClick={onClick}
    >
      <ImageDisplay
        imageKey={product.imageKeys[0] ?? null}
        alt={product.name}
        className="w-full h-44 rounded-t-lg"
      />
      <div className="p-4 flex-1">
        <h3 className="text-white font-semibold mb-1 group-hover:text-orange transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3 mb-3">{product.description}</p>
        <p className="text-orange font-bold">
          {formatTHB(product.unitPrice)} / {product.unit}
        </p>
      </div>
      <div className="px-4 pb-4">
        {inCart ? (
          <div className="w-full text-center text-sm text-green-400 font-medium py-2 rounded-md bg-green-900/20 border border-green-900/40">
            ในคำขอแล้ว ({inCart.quantity} {product.unit})
          </div>
        ) : (
          <div className="w-full text-center text-sm text-gray-500 py-2 rounded-md border border-steel group-hover:border-orange group-hover:text-orange transition-colors">
            คลิกเพื่อดูรายละเอียด
          </div>
        )}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { data: categories, isLoading: catLoading } = useCategories()
  const { data: products, isLoading: prodLoading } = useProducts(false)
  const [selected, setSelected] = useState<Product | null>(null)

  const isLoading = catLoading || prodLoading

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8 bg-card-bg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-lg bg-card-bg" />
          ))}
        </div>
      </div>
    )
  }

  const allProducts = products ?? []
  const allCategories = categories ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">บริการและสินค้า</h1>

      <Tabs defaultValue="all">
        <TabsList className="bg-card-bg border border-steel mb-8 flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-orange data-[state=active]:text-white">
            ทั้งหมด
          </TabsTrigger>
          {allCategories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-orange data-[state=active]:text-white"
            >
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
            ))}
          </div>
          {allProducts.length === 0 && (
            <p className="text-gray-400 text-center py-16">ยังไม่มีสินค้า</p>
          )}
        </TabsContent>

        {allCategories.map((cat) => {
          const filtered = allProducts.filter((p) => p.categoryId === cat.id)
          return (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-gray-400 text-center py-16">ไม่มีสินค้าในหมวดหมู่นี้</p>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
