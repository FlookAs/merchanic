import apiClient from '@/lib/axios'
import type { QuoteDocument, QuoteRequest, QuoteStatus } from '@/types'

export interface CreateQuotePayload {
  customerName: string
  company?: string
  email: string
  phone: string
  message?: string
  items: { productId: string; quantity: number }[]
}

export const getQuotes = () =>
  apiClient.get<QuoteRequest[]>('/quotes').then((r) => r.data)

export const getQuote = (id: string) =>
  apiClient.get<QuoteRequest>(`/quotes/${id}`).then((r) => r.data)

export const createQuote = (data: CreateQuotePayload) =>
  apiClient.post<QuoteRequest>('/quotes', data).then((r) => r.data)

export const updateQuoteStatus = (
  id: string,
  status: QuoteStatus,
  assignedToId?: string,
) =>
  apiClient
    .patch<QuoteRequest>(`/quotes/${id}/status`, { status, assignedToId })
    .then((r) => r.data)

export const adjustItemPrice = (quoteId: string, itemId: string, adjustedUnitPrice: number) =>
  apiClient
    .patch<QuoteRequest>(`/quotes/${quoteId}/items/${itemId}`, { adjustedUnitPrice })
    .then((r) => r.data)

export const generateDocument = (quoteId: string) =>
  apiClient.post<QuoteDocument>(`/quotes/${quoteId}/document`).then((r) => r.data)

export const deleteQuote = (id: string) =>
  apiClient.delete(`/quotes/${id}`).then((r) => r.data)

export const deleteDocument = (quoteId: string, documentId: string) =>
  apiClient.delete(`/quotes/${quoteId}/document/${documentId}`).then((r) => r.data)
