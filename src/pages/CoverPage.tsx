import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function CoverPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/home', { replace: true })
    })
  }, [navigate])

  return (
    <div className="relative flex flex-col min-h-[100dvh] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, oklch(97.5% 0.008 160) 0%, oklch(94% 0.022 160) 45%, oklch(89% 0.032 160) 100%)' }}
    >
      {/* 브랜드 — 중앙 */}
      <header className="px-6 pt-16 shrink-0 text-center">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-brand uppercase">
          Korea 100 Peaks
        </p>
        <h1
          className="font-extrabold text-ink leading-[0.85] mt-3"
          style={{ fontSize: '4.5rem' }}
        >
          Peak<span className="text-brand">Log</span>
        </h1>
        <p className="text-sm text-ink-2 mt-3">나만의 100대 명산 등산 기록</p>
      </header>

      {/* 씬 — 캐릭터 + 능선 */}
      <div className="relative flex-1 flex items-center justify-center min-h-0">
        <img
          src="/cover-character.png"
          alt="등산 캐릭터"
          className="relative z-10 w-64 object-contain animate-float drop-shadow-lg"
          style={{ marginBottom: '40px' }}
        />

        {/* 4겹 능선 — 직선, 깊이감 */}
        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 430 240"
          preserveAspectRatio="none"
          style={{ height: '240px' }}
        >
          {/* 먼 산 — 가장 연한 */}
          <path
            d="M0,105 L55,65 L110,92 L170,48 L225,78 L280,42 L335,72 L390,50 L430,68 L430,240 L0,240 Z"
            fill="var(--color-rule)"
            opacity="0.7"
          />
          {/* 중간 산 — brand 톤 */}
          <path
            d="M0,140 L50,100 L100,128 L160,82 L215,112 L275,72 L325,105 L385,80 L430,98 L430,240 L0,240 Z"
            fill="var(--color-brand)"
            opacity="0.4"
          />
          {/* 가까운 산 — 진한 brand */}
          <path
            d="M0,172 L65,138 L125,162 L195,122 L255,150 L315,118 L375,145 L415,130 L430,140 L430,240 L0,240 Z"
            fill="var(--color-brand)"
            opacity="0.7"
          />
          {/* 전면 — ink 색 */}
          <path
            d="M0,198 L80,172 L145,192 L220,165 L290,185 L355,168 L405,180 L430,174 L430,240 L0,240 Z"
            fill="var(--color-ink)"
            opacity="0.9"
          />
          {/* 깃발 — 크림 포인트 */}
          <path d="M255,150 L255,132 L269,138 L255,144 Z" fill="var(--color-accent)" />
          <line
            x1="255" y1="150" x2="255" y2="132"
            stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round"
          />
        </svg>
      </div>

      {/* CTA — B 레이아웃: 텍스트/아이콘 분리형 pill */}
      <footer className="relative z-20 px-7 pb-12 pt-4 shrink-0">
        <div className="border-2 border-ink/12 rounded-full p-1.5">
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-between bg-accent rounded-full pl-8 pr-1.5 py-1.5
                       transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <span className="flex-1 text-center text-ink text-lg font-bold">시작하기</span>
            <span className="w-11 h-11 bg-brand rounded-full flex items-center justify-center shrink-0">
              <ArrowUpRight size={18} className="text-white" strokeWidth={2.5} />
            </span>
          </button>
        </div>
        <p className="text-xs text-muted text-center mt-3">
          로그인하여 나의 등산 기록을 저장하세요
        </p>
      </footer>
    </div>
  )
}
