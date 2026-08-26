import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCategories } from '@/hooks/useCategories'
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from '@/hooks/useProducts'
import { uploadProductImages } from '@/lib/api/products'
import { formatTHB } from '@/lib/utils'
import type { Product } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  description: z.string().min(1, 'กรุณากรอกรายละเอียด'),
  unitPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  unit: z.string().min(1, 'กรุณากรอกหน่วย'),
  categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  isPublished: z.boolean(),
})
type FormValues = z.infer<typeof schema>

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts(true)
  const { data: categories } = useCategories()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [imageKeys, setImageKeys] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', unitPrice: 0, unit: 'ชุด', categoryId: '', isPublished: false },
  })

  const openCreate = () => {
    setEditing(null)
    setImageKeys([])
    form.reset({ name: '', description: '', unitPrice: 0, unit: 'ชุด', categoryId: '', isPublished: false })
    setOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setImageKeys(p.imageKeys)
    form.reset({
      name: p.name,
      description: p.description,
      unitPrice: Number(p.unitPrice),
      unit: p.unit,
      categoryId: p.categoryId,
      isPublished: p.isPublished,
    })
    setOpen(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const keys = await uploadProductImages(files)
      setImageKeys((prev) => [...prev, ...keys])
    } catch {
      toast.error('อัปโหลดรูปไม่สำเร็จ')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (key: string) => setImageKeys((prev) => prev.filter((k) => k !== key))

  const onSubmit = (values: FormValues) => {
    const payload = { ...values, imageKeys, unitPrice: String(values.unitPrice) }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload }, {
        onSuccess: () => { toast.success('แก้ไขสินค้าแล้ว'); setOpen(false) },
        onError: () => toast.error('แก้ไขสินค้าไม่สำเร็จ'),
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success('เพิ่มสินค้าแล้ว'); setOpen(false) },
        onError: () => toast.error('เพิ่มสินค้าไม่สำเร็จ'),
      })
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`ลบสินค้า "${name}" ใช่ไหม?`)) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('ลบแล้ว'),
      onError: () => toast.error('ลบสินค้าไม่สำเร็จ'),
    })
  }

  const getCategoryName = (id: string) => categories?.find((c) => c.id === id)?.name ?? '—'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">สินค้า</h1>
        <Button className="bg-orange hover:bg-orange-dark text-white gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />เพิ่มสินค้า
        </Button>
      </div>

      <div className="bg-card-bg rounded-lg border border-steel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-steel hover:bg-transparent">
              <TableHead className="text-gray-400 w-14"></TableHead>
              <TableHead className="text-gray-400">ชื่อสินค้า</TableHead>
              <TableHead className="text-gray-400">หมวดหมู่</TableHead>
              <TableHead className="text-gray-400 text-right">ราคา</TableHead>
              <TableHead className="text-gray-400 text-center">เผยแพร่</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-steel">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 bg-body-bg" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (products ?? []).length === 0 ? (
              <TableRow className="border-steel">
                <TableCell colSpan={6} className="text-center text-gray-400 py-10">ยังไม่มีสินค้า</TableCell>
              </TableRow>
            ) : (
              (products ?? []).map((p) => (
                <TableRow key={p.id} className="border-steel hover:bg-navy-light">
                  <TableCell>
                    {p.imageKeys[0] ? (
                      <img
                        src={`${import.meta.env.VITE_R2_BASE_URL}/${p.imageKeys[0]}`}
                        alt={p.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-body-bg flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-white">{p.name}</TableCell>
                  <TableCell className="text-gray-400">{getCategoryName(p.categoryId)}</TableCell>
                  <TableCell className="text-gray-300 text-right font-mono text-sm">{formatTHB(p.unitPrice)} / {p.unit}</TableCell>
                  <TableCell className="text-center">
                    <span className={`text-xs font-medium ${p.isPublished ? 'text-green-400' : 'text-gray-500'}`}>
                      {p.isPublished ? 'เผยแพร่' : 'ซ่อน'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-7" onClick={() => openEdit(p)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-7" onClick={() => handleDelete(p.id, p.name)}>
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
        <DialogContent className="bg-card-bg border-steel text-white max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle className="text-white">{editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">ชื่อสินค้า</FormLabel>
                    <FormControl><Input className="bg-body-bg border-steel text-white" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">รายละเอียด</FormLabel>
                    <FormControl>
                      <textarea className="w-full min-h-20 rounded-md border border-steel bg-body-bg text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="unitPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">ราคา (บาท)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-body-bg border-steel text-white"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">หน่วย</FormLabel>
                      <FormControl><Input className="bg-body-bg border-steel text-white" placeholder="ชุด / ชิ้น" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">หมวดหมู่</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-body-bg border-steel text-white">
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card-bg border-steel text-white">
                        {(categories ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.id} className="focus:bg-navy-light">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="isPublished" render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-orange" />
                    </FormControl>
                    <FormLabel className="text-gray-300 mt-0!">เผยแพร่ (แสดงในหน้า public)</FormLabel>
                  </FormItem>
                )} />

                {/* Multi-image upload */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">รูปภาพสินค้า ({imageKeys.length} รูป)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {imageKeys.map((key) => (
                      <div key={key} className="relative aspect-square rounded-lg overflow-hidden border border-steel">
                        <img
                          src={`${import.meta.env.VITE_R2_BASE_URL}/${key}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black"
                          onClick={() => removeImage(key)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="aspect-square rounded-lg border border-dashed border-steel flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-orange hover:text-orange transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span className="text-xs">เพิ่มรูป</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP ≤ 5MB · เลือกได้หลายรูปพร้อมกัน</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <DialogFooter className="gap-2 pt-2 pb-2">
                  <Button type="button" variant="ghost" className="text-gray-400" onClick={() => setOpen(false)}>ยกเลิก</Button>
                  <Button type="submit" className="bg-orange hover:bg-orange-dark text-white" disabled={createMutation.isPending || updateMutation.isPending}>บันทึก</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
