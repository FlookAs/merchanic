import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QuoteStatus } from '@/types'
import {
  adjustItemPrice,
  deleteDocument,
  deleteQuote,
  generateDocument,
  getQuote,
  getQuotes,
  updateQuoteStatus,
} from '@/lib/api/quotes'

export const QUOTES_KEY = ['quotes']
export const QUOTE_KEY = (id: string) => ['quotes', id]

export function useQuotes() {
  return useQuery({ queryKey: QUOTES_KEY, queryFn: getQuotes })
}

export function useQuote(id: string) {
  return useQuery({ queryKey: QUOTE_KEY(id), queryFn: () => getQuote(id), enabled: !!id })
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      assignedToId,
    }: {
      id: string
      status: QuoteStatus
      assignedToId?: string
    }) => updateQuoteStatus(id, status, assignedToId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUOTES_KEY })
      qc.invalidateQueries({ queryKey: QUOTE_KEY(vars.id) })
    },
  })
}

export function useAdjustItemPrice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      quoteId,
      itemId,
      price,
    }: {
      quoteId: string
      itemId: string
      price: number
    }) => adjustItemPrice(quoteId, itemId, price),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: QUOTE_KEY(vars.quoteId) })
    },
  })
}

export function useGenerateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (quoteId: string) => generateDocument(quoteId),
    onSuccess: (_, quoteId) => {
      qc.invalidateQueries({ queryKey: QUOTE_KEY(quoteId) })
      qc.invalidateQueries({ queryKey: QUOTES_KEY })
    },
  })
}

export function useDeleteQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTES_KEY }),
  })
}

export function useDeleteDocument(quoteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(quoteId, documentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTE_KEY(quoteId) }),
  })
}
