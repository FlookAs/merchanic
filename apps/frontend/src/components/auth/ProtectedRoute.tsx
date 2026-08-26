import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  requiredRole?: Role
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { token, user } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/admin/quotes" replace />
  }

  return <Outlet />
}
