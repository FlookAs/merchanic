import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Wrench } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import apiClient from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const schema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

type LoginValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    try {
      const { data } = await apiClient.post<{ access_token: string }>('/auth/login', values)
      login(data.access_token)
      navigate('/admin/quotes', { replace: true })
    } catch {
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    }
  }

  return (
    <div className="min-h-screen bg-body-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-2xl mb-2">
            <Wrench className="w-7 h-7 text-orange" />
            MERCHANIC
          </div>
          <p className="text-gray-400 text-sm">ระบบจัดการหลังบ้าน</p>
        </div>

        <div className="bg-card-bg border border-steel rounded-xl p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">อีเมล</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="bg-body-bg border-steel text-white"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="bg-body-bg border-steel text-white"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-orange hover:bg-orange-dark text-white mt-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />กำลังเข้าสู่ระบบ...</>
                ) : 'เข้าสู่ระบบ'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
