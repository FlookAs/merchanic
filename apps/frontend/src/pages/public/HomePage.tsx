import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveIcon } from '@/components/shared/IconPicker'
import ImageDisplay from '@/components/shared/ImageDisplay'
import { PortfolioDetailModal } from '@/components/shared/PortfolioDetailModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/hooks/useCategories'
import { usePortfolios } from '@/hooks/usePortfolios'
import type { Portfolio } from '@/types'

export default function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: portfolios, isLoading } = usePortfolios()
  const preview = portfolios?.slice(0, 4) ?? []
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            บริการวิศวกรรมอุตสาหกรรม<br />
            <span className="text-orange">ครบวงจร</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            เชี่ยวชาญระบบบำบัดน้ำ ซ่อมรอยรั่ว และงานเชื่อม/ซ่อมเครื่องจักร
            ด้วยทีมช่างผู้เชี่ยวชาญและประสบการณ์กว่า 10 ปี
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote">
              <Button size="lg" className="bg-orange hover:bg-orange-dark text-white gap-2">
                ขอใบเสนอราคา <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-gray-500 text-gray-200 hover:bg-navy-light">
                ดูบริการทั้งหมด
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 bg-card-bg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">บริการของเรา</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoriesLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-lg bg-body-bg" />
                ))
              : (categories ?? []).map((cat) => {
                  const Icon = resolveIcon(cat.icon)
                  return (
                    <Card key={cat.id} className="bg-body-bg border-steel">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-6 h-6 text-orange" />
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">{cat.name}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{cat.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
          </div>
        </div>
      </section>

      {/* Portfolio preview */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-white">ผลงานล่าสุด</h2>
            <Link to="/portfolio" className="text-orange hover:text-orange-dark text-sm font-medium flex items-center gap-1">
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg bg-card-bg" />
                ))
              : preview.map((p) => (
                  <Card
                    key={p.id}
                    className="bg-card-bg border-steel overflow-hidden group cursor-pointer hover:border-orange transition-colors"
                    onClick={() => setSelectedPortfolio(p)}
                  >
                    <ImageDisplay
                      imageKey={p.imageKeys[0] ?? null}
                      alt={p.title}
                      className="w-full h-40 group-hover:scale-105 transition-transform duration-300"
                    />
                    <CardContent className="p-3">
                      <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-orange transition-colors">{p.title}</p>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      <PortfolioDetailModal portfolio={selectedPortfolio} onClose={() => setSelectedPortfolio(null)} />

      {/* CTA */}
      <section className="bg-navy py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">พร้อมให้บริการ</h2>
          <p className="text-gray-300 mb-8">
            ติดต่อเราเพื่อรับใบเสนอราคาฟรี ทีมงานพร้อมให้คำปรึกษาตลอดเวลา
          </p>
          <Link to="/quote">
            <Button size="lg" className="bg-orange hover:bg-orange-dark text-white gap-2">
              ขอใบเสนอราคาตอนนี้ <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
