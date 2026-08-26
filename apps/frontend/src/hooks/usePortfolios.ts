import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Portfolio } from '@/types'
import {
  createPortfolio,
  deletePortfolio,
  getPortfolios,
  updatePortfolio,
} from '@/lib/api/portfolios'

export const PORTFOLIOS_KEY = ['portfolios']

export function usePortfolios() {
  return useQuery({ queryKey: PORTFOLIOS_KEY, queryFn: getPortfolios })
}

export function useCreatePortfolio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => qc.invalidateQueries({ queryKey: PORTFOLIOS_KEY }),
  })
}

export function useUpdatePortfolio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Portfolio> }) =>
      updatePortfolio(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PORTFOLIOS_KEY }),
  })
}

export function useDeletePortfolio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePortfolio,
    onSuccess: () => qc.invalidateQueries({ queryKey: PORTFOLIOS_KEY }),
  })
}
