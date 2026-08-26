import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'
import PublicLayout from '@/components/layout/PublicLayout'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import LoginPage from '@/pages/admin/LoginPage'
import PortfoliosPage from '@/pages/admin/PortfoliosPage'
import ProductsPage from '@/pages/admin/ProductsPage'
import QuoteDetailPage from '@/pages/admin/QuoteDetailPage'
import QuotesListPage from '@/pages/admin/QuotesListPage'
import HomePage from '@/pages/public/HomePage'
import PortfolioPage from '@/pages/public/PortfolioPage'
import QuotePage from '@/pages/public/QuotePage'
import ServicesPage from '@/pages/public/ServicesPage'

export default function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/quote" element={<QuotePage />} />
        </Route>

        {/* Admin — login (no layout) */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin — protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/quotes" element={<QuotesListPage />} />
            <Route path="/admin/quotes/:id" element={<QuoteDetailPage />} />

            {/* ADMIN-only pages */}
            <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/portfolios" element={<PortfoliosPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  )
}
