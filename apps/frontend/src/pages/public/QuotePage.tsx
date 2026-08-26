import { useState } from 'react'
import StepConfirmation from '@/components/quote/StepConfirmation'
import StepContactForm, { type ContactFormValues } from '@/components/quote/StepContactForm'
import StepProductSelect from '@/components/quote/StepProductSelect'

const STEPS = ['เลือกสินค้า', 'ข้อมูลติดต่อ', 'ยืนยัน']

export default function QuotePage() {
  const [step, setStep] = useState(0)
  const [contact, setContact] = useState<ContactFormValues | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">ขอใบเสนอราคา</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-orange' : 'text-gray-500'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < step
                    ? 'bg-orange border-orange text-white'
                    : i === step
                    ? 'border-orange text-orange'
                    : 'border-steel text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-orange' : 'bg-steel'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      {step === 0 && <StepProductSelect onNext={() => setStep(1)} />}
      {step === 1 && (
        <StepContactForm
          onNext={(data) => { setContact(data); setStep(2) }}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && contact && (
        <StepConfirmation contact={contact} onBack={() => setStep(1)} />
      )}
    </div>
  )
}
