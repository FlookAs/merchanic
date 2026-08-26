import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { decodeToken } from '@/lib/auth'
import type { JwtPayload } from '@/types'

interface AuthState {
  token: string | null
  user: JwtPayload | null
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token: string) => {
        const user = decodeToken(token)
        set({ token, user })
      },
      logout: () => {
        set({ token: null, user: null })
      },
    }),
    { name: 'merchanic-auth' },
  ),
)
