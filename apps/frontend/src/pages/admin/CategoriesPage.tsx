import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import IconPicker from '@/components/shared/IconPicker'
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories'
import type { Category } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่'),
  slug: z.string().min(1, 'กรุณากรอก slug').regex(/^[a-z0-9-]+$/, 'slug ใช้ได้เฉพาะตัวอักษรเล็ก ตัวเลข และ -'),
  description: z.string().optional(),
  icon: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '', icon: '' },
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ name: '', slug: '', description: '', icon: '' })
    setOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    form.reset({ name: cat.name, slug: cat.slug, description: cat.description ?? '', icon: cat.icon ?? '' })
    setOpen(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: () => { toast.success('แก้ไขหมวดหมู่แล้ว'); setOpen(false) }, onError: () => toast.error('แก้ไขหมวดหมู่ไม่สำเร็จ') },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => { toast.success('เพิ่มหมวดหมู่แล้ว'); setOpen(false) },
        onError: () => toast.error('เพิ่มหมวดหมู่ไม่สำเร็จ'),
      })
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ลบหมวดหมู่ "${name}" ใช่ไหม?`)) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('ลบแล้ว'),
      onError: () => toast.error('ลบหมวดหมู่ไม่สำเร็จ'),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">หมวดหมู่</h1>
        <Button className="bg-orange hover:bg-orange-dark text-white gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />เพิ่มหมวดหมู่
        </Button>
      </div>

      <div className="bg-card-bg rounded-lg border border-steel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-steel hover:bg-transparent">
              <TableHead className="text-gray-400">ชื่อ</TableHead>
              <TableHead className="text-gray-400">Slug</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-steel">
                  <TableCell><Skeleton className="h-4 bg-body-bg" /></TableCell>
                  <TableCell><Skeleton className="h-4 bg-body-bg" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : (categories ?? []).length === 0 ? (
              <TableRow className="border-steel">
                <TableCell colSpan={3} className="text-center text-gray-400 py-10">ยังไม่มีหมวดหมู่</TableCell>
              </TableRow>
            ) : (
              (categories ?? []).map((cat) => (
                <TableRow key={cat.id} className="border-steel hover:bg-navy-light">
                  <TableCell className="text-white">{cat.name}</TableCell>
                  <TableCell className="text-gray-400 font-mono text-sm">{cat.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7" onClick={() => openEdit(cat)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-7" onClick={() => handleDelete(cat.id, cat.name)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card-bg border-steel text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">ชื่อหมวดหมู่</FormLabel>
                  <FormControl><Input className="bg-body-bg border-steel text-white" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Slug (URL)</FormLabel>
                  <FormControl><Input className="bg-body-bg border-steel text-white font-mono" placeholder="water-treatment" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">คำอธิบาย (แสดงหน้าแรก)</FormLabel>
                  <FormControl><Textarea className="bg-body-bg border-steel text-white resize-none" rows={3} placeholder="อธิบายบริการสั้น ๆ..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">ไอคอน</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" className="text-gray-400" onClick={() => setOpen(false)}>ยกเลิก</Button>
                <Button type="submit" className="bg-orange hover:bg-orange-dark text-white" disabled={createMutation.isPending || updateMutation.isPending}>บันทึก</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
