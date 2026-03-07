import { useNavigate, useLocation } from 'react-router-dom'
import { Home, List, Map, BookOpen } from 'lucide-react'

const tabs = [
  { path: '/home',  label: '홈',   icon: Home },
  { path: '/list',  label: '리스트', icon: List },
  { path: '/map',   label: '지도',  icon: Map },
  { path: '/diary', label: '기록',  icon: BookOpen },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[#e8f0f8] flex">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors
              ${active ? 'text-[#e63329]' : 'text-[#b0c8de]'}`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
