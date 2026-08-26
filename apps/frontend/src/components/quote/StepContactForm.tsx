import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const schema = z.object({
  customerName: z.string().min(1, 'กรุณากรอกชื่อ'),
  company: z.string().optional(),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  phone: z.string().regex(/^0\d{8,9}$/, 'เบอร์โทรไม่ถูกต้อง (ตัวอย่าง: 0812345678)'),
  message: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof schema>

interface StepContactFormProps {
  onNext: (data: ContactFormValues) => void
  onBack: () => void
}

export default function StepContactForm({ onNext, onBack }: StepContactFormProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: '', company: '', email: '', phone: '', message: '' },
  })

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-white font-semibold mb-6">กรอกข้อมูลติดต่อ</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">ชื่อ-นามสกุล *</FormLabel>
                <FormControl>
                  <Input className="bg-card-bg border-steel text-white" placeholder="ชื่อ-นามสกุล" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">บริษัท / องค์กร</FormLabel>
                <FormControl>
                  <Input className="bg-card-bg border-steel text-white" placeholder="ชื่อบริษัท (ถ้ามี)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">อีเมล *</FormLabel>
                <FormControl>
                  <Input type="email" className="bg-card-bg border-steel text-white" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">เบอร์โทรศัพท์ *</FormLabel>
                <FormControl>
                  <Input className="bg-card-bg border-steel text-white" placeholder="0xx-xxx-xxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">ข้อความเพิ่มเติม</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-24 rounded-md border border-steel bg-card-bg text-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange"
                    placeholder="รายละเอียดเพิ่มเติม..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-steel text-gray-300 hover:bg-card-bg"
              onClick={onBack}
            >
              ← ย้อนกลับ
            </Button>
            <Button type="submit" className="flex-1 bg-orange hover:bg-orange-dark text-white">
              ถัดไป: ยืนยัน →
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
