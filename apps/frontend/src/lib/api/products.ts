import apiClient from '@/lib/axios'
import type { Product } from '@/types'

export const getProducts = (all = false) =>
  apiClient.get<Product[]>('/products', { params: all ? { all: 'true' } : {} }).then((r) => r.data)

export const getProduct = (id: string) =>
  apiClient.get<Product>(`/products/${id}`).then((r) => r.data)

export const createProduct = (data: Partial<Product>) =>
  apiClient.post<Product>('/products', data).then((r) => r.data)

export const updateProduct = (id: string, data: Partial<Product>) =>
  apiClient.patch<Product>(`/products/${id}`, data).then((r) => r.data)

export const deleteProduct = (id: string) =>
  apiClient.delete(`/products/${id}`).then((r) => r.data)

export const uploadProductImages = (files: File[]): Promise<string[]> => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  return apiClient
    .post<{ imageKeys: string[] }>('/uploads/products', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.imageKeys)
}
