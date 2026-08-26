import apiClient from '@/lib/axios'
import type { Portfolio } from '@/types'

export const getPortfolios = () =>
  apiClient.get<Portfolio[]>('/portfolios').then((r) => r.data)

export const getPortfolio = (id: string) =>
  apiClient.get<Portfolio>(`/portfolios/${id}`).then((r) => r.data)

export const createPortfolio = (data: Partial<Portfolio>) =>
  apiClient.post<Portfolio>('/portfolios', data).then((r) => r.data)

export const updatePortfolio = (id: string, data: Partial<Portfolio>) =>
  apiClient.patch<Portfolio>(`/portfolios/${id}`, data).then((r) => r.data)

export const deletePortfolio = (id: string) =>
  apiClient.delete(`/portfolios/${id}`).then((r) => r.data)

export const uploadPortfolioImages = (files: File[]): Promise<string[]> => {
  const form = new FormData()
  files.forEach((f) => form.append('files', f))
  return apiClient
    .post<{ imageKeys: string[] }>('/uploads/portfolios', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.imageKeys)
}
