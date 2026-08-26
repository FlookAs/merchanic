import { Menu, ShoppingCart, Wrench, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cartStore'

const NAV_LINKS = [
  { to: '/services', label: 'บริการ / สินค้า' },
  { to: '/portfolio', label: 'ผลงาน' },
]

export default function Header() {
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-navy sticky top-0 z-50 border-b border-navy-light shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
            <Wrench className="w-6 h-6 text-orange" />
            MERCHANIC
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-orange' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/quote" className="relative">
              <Button size="sm" className="bg-orange hover:bg-orange-dark text-white gap-2">
                <ShoppingCart className="w-4 h-4" />
                ขอใบเสนอราคา
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-orange text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-navy-light border-t border-navy px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="text-gray-300 hover:text-white text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/quote" onClick={() => setMenuOpen(false)}>
            <Button size="sm" className="bg-orange hover:bg-orange-dark text-white gap-2 w-full">
              <ShoppingCart className="w-4 h-4" />
              ขอใบเสนอราคา {cartCount > 0 && `(${cartCount})`}
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
