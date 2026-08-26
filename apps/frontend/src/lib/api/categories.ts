import apiClient from '@/lib/axios'
import type { Category } from '@/types'

export const getCategories = () =>
  apiClient.get<Category[]>('/categories').then((r) => r.data)

export const getCategory = (id: string) =>
  apiClient.get<Category>(`/categories/${id}`).then((r) => r.data)

export const createCategory = (data: { name: string; slug: string; description?: string; icon?: string }) =>
  apiClient.post<Category>('/categories', data).then((r) => r.data)

export const updateCategory = (id: string, data: { name?: string; slug?: string; description?: string; icon?: string }) =>
  apiClient.patch<Category>(`/categories/${id}`, data).then((r) => r.data)

export const deleteCategory = (id: string) =>
  apiClient.delete(`/categories/${id}`).then((r) => r.data)
