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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface border-t border-rule flex pb-safe">
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors"
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 1.6}
              className={active ? 'text-ink' : 'text-faint'} />
            <span className={`text-[10px] transition-colors
              ${active ? 'text-ink font-semibold' : 'text-faint font-medium'}`}>
              {label}
            </span>
            {active && <div className="w-1 h-1 rounded-full bg-brand mt-0.5" />}
          </button>
        )
      })}
    </nav>
  )
}
