import { useState } from 'react'
import { PortfolioDetailModal } from '@/components/shared/PortfolioDetailModal'
import ImageDisplay from '@/components/shared/ImageDisplay'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCategories } from '@/hooks/useCategories'
import { usePortfolios } from '@/hooks/usePortfolios'
import type { Portfolio } from '@/types'

function PortfolioCard({ p, onClick }: { p: Portfolio; onClick: () => void }) {
  return (
    <Card
      className="bg-card-bg border-steel overflow-hidden group cursor-pointer hover:border-orange transition-colors flex flex-col"
      onClick={onClick}
    >
      <ImageDisplay
        imageKey={p.imageKeys[0] ?? null}
        alt={p.title}
        className="w-full h-52 group-hover:scale-105 transition-transform duration-300 shrink-0"
      />
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="text-white font-semibold mb-1 group-hover:text-orange transition-colors line-clamp-2">
          {p.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3 flex-1">{p.description}</p>
        <div className="flex items-center justify-between mt-3">
          {p.relatedService ? (
            <span className="text-xs text-orange border border-orange/40 rounded px-2 py-0.5">
              {p.relatedService.name}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-500 group-hover:text-orange transition-colors">
            คลิกดูรายละเอียด →
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PortfolioPage() {
  const { data: portfolios, isLoading: portLoading } = usePortfolios()
  const { data: categories, isLoading: catLoading } = useCategories()
  const [selected, setSelected] = useState<Portfolio | null>(null)

  const isLoading = portLoading || catLoading

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-2 bg-card-bg" />
        <Skeleton className="h-5 w-72 mb-10 bg-card-bg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg bg-card-bg" />
          ))}
        </div>
      </div>
    )
  }

  const allPortfolios = portfolios ?? []
  const allCategories = (categories ?? []).filter((cat) =>
    allPortfolios.some((p) => p.relatedServiceId === cat.id),
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">ผลงานของเรา</h1>
      <p className="text-gray-400 mb-10">ตัวอย่างผลงานที่ผ่านมาจากทีมช่างผู้เชี่ยวชาญ</p>

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
          {allPortfolios.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPortfolios.map((p) => (
                <PortfolioCard key={p.id} p={p} onClick={() => setSelected(p)} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-16">ยังไม่มีผลงาน</p>
          )}
        </TabsContent>

        {allCategories.map((cat) => {
          const filtered = allPortfolios.filter((p) => p.relatedServiceId === cat.id)
          return (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p) => (
                  <PortfolioCard key={p.id} p={p} onClick={() => setSelected(p)} />
                ))}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      <PortfolioDetailModal portfolio={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
