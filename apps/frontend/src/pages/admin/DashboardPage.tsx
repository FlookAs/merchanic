import { Clock, FileText, Package, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { usePortfolios } from '@/hooks/usePortfolios'
import { useProducts } from '@/hooks/useProducts'
import { useQuotes } from '@/hooks/useQuotes'
import { formatTHB } from '@/lib/utils'
import type { QuoteStatus } from '@/types'

const STATUS_LABEL: Record<QuoteStatus, string> = {
  NEW: 'ใหม่',
  REVIEWING: 'กำลังดำเนินการ',
  ADJUSTED: 'ปรับแล้ว',
  QUOTED: 'เสนอราคาแล้ว',
  CLOSED: 'ปิดแล้ว',
}

const STATUS_COLOR: Record<QuoteStatus, string> = {
  NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REVIEWING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ADJUSTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  QUOTED: 'bg-orange/20 text-orange border-orange/30',
  CLOSED: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const STATUSES: QuoteStatus[] = ['NEW', 'REVIEWING', 'ADJUSTED', 'QUOTED', 'CLOSED']

function StatCard({
  label, value, sub, icon: Icon, iconClass,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  iconClass: string
}) {
  return (
    <div className="bg-card-bg border border-steel rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: quotes, isLoading: quotesLoading } = useQuotes()
  const { data: products } = useProducts(true)
  const { data: portfolios } = usePortfolios()

  const quoteList = quotes ?? []
  const productList = products ?? []
  const portfolioList = portfolios ?? []

  const countByStatus = (s: QuoteStatus) => quoteList.filter((q) => q.status === s).length
  const revenue = quoteList
    .filter((q) => q.status === 'QUOTED' || q.status === 'CLOSED')
    .reduce((sum, q) => sum + Number(q.finalTotal), 0)
  const publishedCount = productList.filter((p) => p.isPublished).length
  const recentQuotes = quoteList.slice(0, 4)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">ภาพรวม</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="คำขอทั้งหมด"
          value={quotesLoading ? '—' : quoteList.length}
          icon={FileText}
          iconClass="bg-orange/10 text-orange"
        />
        <StatCard
          label="รอดำเนินการ"
          value={quotesLoading ? '—' : countByStatus('NEW')}
          sub="สถานะ NEW"
          icon={Clock}
          iconClass="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="รายได้รวม"
          value={quotesLoading ? '—' : formatTHB(revenue)}
          sub="จากที่เสนอ + ปิดแล้ว"
          icon={TrendingUp}
          iconClass="bg-green-500/10 text-green-400"
        />
        <StatCard
          label="สินค้าที่เผยแพร่"
          value={`${publishedCount} / ${productList.length}`}
          sub={`ผลงาน ${portfolioList.length} รายการ`}
          icon={Package}
          iconClass="bg-purple-500/10 text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status breakdown */}
        <div className="bg-card-bg border border-steel rounded-lg p-5">
          <h2 className="text-white font-semibold mb-4">สถานะคำขอ</h2>
          {quotesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 bg-body-bg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {STATUSES.map((status) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLOR[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="text-white font-bold tabular-nums">{countByStatus(status)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 pt-4 border-t border-steel grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <p className="text-gray-400">สินค้า</p>
              <p className="text-white font-bold">{productList.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">ผลงาน</p>
              <p className="text-white font-bold">{portfolioList.length}</p>
            </div>
          </div>
        </div>

        {/* Recent quotes */}
        <div className="bg-card-bg border border-steel rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">คำขอล่าสุด</h2>
            <Link to="/admin/quotes" className="text-orange text-xs hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          {quotesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-body-bg" />
              ))}
            </div>
          ) : recentQuotes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">ยังไม่มีคำขอ</p>
          ) : (
            <div className="divide-y divide-steel">
              {recentQuotes.map((q) => (
                <Link
                  key={q.id}
                  to={`/admin/quotes/${q.id}`}
                  className="flex items-center justify-between py-3 hover:bg-navy-light -mx-5 px-5 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{q.customerName}</p>
                    <p className="text-gray-500 text-xs truncate">{q.company ?? q.email}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLOR[q.status as QuoteStatus]}`}>
                      {STATUS_LABEL[q.status as QuoteStatus]}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">{formatTHB(q.finalTotal)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
