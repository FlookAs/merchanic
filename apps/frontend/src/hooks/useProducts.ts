import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Product } from '@/types'
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '@/lib/api/products'

export const PRODUCTS_KEY = (all = false) => ['products', { all }]

export function useProducts(all = false) {
  return useQuery({ queryKey: PRODUCTS_KEY(all), queryFn: () => getProducts(all) })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
