import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Portfolio } from '@/types'

const R2 = import.meta.env.VITE_R2_BASE_URL ?? ''

function ModalContent({ portfolio }: { portfolio: Portfolio }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const images = portfolio.imageKeys
  const activeKey = images[activeIdx] ?? null

  return (
    <DialogContent className="bg-card-bg border-steel text-white max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
      {/* รูปหลัก — fixed */}
      <div className="shrink-0">
        {activeKey ? (
          <img
            src={`${R2}/${activeKey}`}
            alt={portfolio.title}
            className="w-full h-60 object-cover"
          />
        ) : (
          <div className="w-full h-60 bg-body-bg flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-2 bg-black/30 overflow-x-auto">
            {images.map((key, i) => (
              <button
                key={key}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-colors ${
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
      <div className="overflow-y-auto flex-1 p-5 space-y-3">
        <div>
          <h2 className="text-white font-bold text-lg leading-snug">{portfolio.title}</h2>
          {portfolio.relatedService && (
            <span className="inline-block mt-2 text-xs text-orange border border-orange/40 rounded px-2 py-0.5">
              {portfolio.relatedService.name}
            </span>
          )}
        </div>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-all">{portfolio.description}</p>
      </div>
    </DialogContent>
  )
}

export function PortfolioDetailModal({
  portfolio,
  onClose,
}: {
  portfolio: Portfolio | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!portfolio} onOpenChange={(open) => { if (!open) onClose() }}>
      {portfolio && <ModalContent portfolio={portfolio} />}
    </Dialog>
  )
}
