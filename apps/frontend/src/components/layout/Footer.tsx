import { Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-navy-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Wrench className="w-5 h-5 text-orange" />
              MERCHANIC
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              บริการวิศวกรรมและซ่อมบำรุงอุตสาหกรรม<br />
              ระบบบำบัดน้ำ · ซ่อมรอยรั่ว · งานเชื่อม
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">บริการ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/services" className="hover:text-orange transition-colors">ระบบบำบัดน้ำ</Link></li>
              <li><Link to="/services" className="hover:text-orange transition-colors">ซ่อมรอยรั่ว</Link></li>
              <li><Link to="/services" className="hover:text-orange transition-colors">งานเชื่อม / ซ่อมเครื่องจักร</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">ติดต่อ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/quote" className="text-orange hover:text-orange-dark font-medium transition-colors">
                  ขอใบเสนอราคา →
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-navy-light mt-8 pt-6 text-center text-gray-500 text-xs">
          © {new Date().getFullYear()} Merchanic. สงวนลิขสิทธิ์
        </div>
      </div>
    </footer>
  )
}
