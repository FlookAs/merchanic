import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  setItemQty: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      setItemQty: (product: Product, quantity: number) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== product.id) })
          return
        }
        const existing = get().items.find((i) => i.productId === product.id)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === product.id ? { ...i, quantity } : i,
            ),
          })
        } else {
          set({
            items: [
              ...get().items,
              {
                productId: product.id,
                name: product.name,
                unit: product.unit,
                unitPriceSnapshot: product.unitPrice,
                quantity,
              },
            ],
          })
        }
      },
      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: 'merchanic-cart' },
  ),
)
