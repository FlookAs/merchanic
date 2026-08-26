import {
  FileText,
  FolderOpen,
  Images,
  LayoutDashboard,
  LogOut,
  Package,
  Wrench,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'ภาพรวม', icon: LayoutDashboard, roles: ['ADMIN', 'SALES'] },
  { to: '/admin/quotes', label: 'รายการคำขอ', icon: FileText, roles: ['ADMIN', 'SALES'] },
  { to: '/admin/categories', label: 'หมวดหมู่', icon: FolderOpen, roles: ['ADMIN'] },
  { to: '/admin/products', label: 'สินค้า', icon: Package, roles: ['ADMIN'] },
  { to: '/admin/portfolios', label: 'ผลงาน', icon: Images, roles: ['ADMIN'] },
] as const

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-navy flex flex-col shrink-0">
        <div className="p-4 border-b border-navy-light">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Wrench className="w-4 h-4 text-orange" />
            MERCHANIC
          </div>
          <p className="text-gray-400 text-xs mt-1 truncate">{user?.email}</p>
          <span className="text-xs text-orange">{user?.role}</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.filter((item) => user && (item.roles as readonly string[]).includes(user.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange text-white'
                    : 'text-gray-300 hover:bg-navy-light hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-navy-light">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-400 hover:text-white gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-body-bg p-6">
        <Outlet />
      </main>
    </div>
  )
}
