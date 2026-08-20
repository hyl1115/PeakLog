import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CoverPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/home', { replace: true })
    })
  }, [navigate])

  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-paper overflow-hidden">
      {/* 브랜드 — 좌측 바이어스 (중앙정렬 히어로 탈피) */}
      <header className="px-7 pt-16 shrink-0">
        <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
          Korea 100 Peaks
        </p>
        <h1
          className="font-extrabold text-ink leading-none mt-1.5"
          style={{ fontSize: '4rem' }}
        >
          PeakLog
        </h1>
        <p className="text-sm text-ink-2 mt-2">나만의 100대 명산 등산 기록</p>
      </header>

      {/* 씬 — 캐릭터가 능선에 발을 붙이고 선다 (허공에 뜬 마스코트 X) */}
      <div className="relative flex-1 flex items-end justify-center min-h-0">
        <img
          src="/cover-character.png"
          alt="등산 캐릭터"
          className="relative z-10 w-60 object-contain animate-float mix-blend-multiply"
          style={{ marginBottom: '108px' }}
        />

        {/* 손으로 그린 3겹 능선 — 장식, 스크린리더 제외 */}
        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 430 200"
          preserveAspectRatio="none"
          style={{ height: '200px' }}
        >
          <path
            d="M0,92 L60,52 L120,86 L190,42 L260,80 L330,46 L392,76 L430,56 L430,200 L0,200 Z"
            fill="var(--color-rule)"
          />
          <path
            d="M0,132 L70,96 L140,126 L210,86 L280,120 L360,92 L430,116 L430,200 L0,200 Z"
            fill="var(--color-brand)"
            opacity="0.55"
          />
          <path
            d="M0,166 L90,136 L160,160 L240,130 L320,158 L400,136 L430,150 L430,200 L0,200 Z"
            fill="var(--color-ink)"
            opacity="0.9"
          />
          {/* 앞 봉우리의 붉은 깃발 — 액센트를 신호로만 소량 사용 */}
          <path d="M240,130 L240,112 L256,118 L240,124 Z" fill="var(--color-brand)" />
          <line
            x1="240" y1="130" x2="240" y2="112"
            stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round"
          />
        </svg>
      </div>

      {/* CTA — 하단 고정 */}
      <footer className="relative z-20 px-7 pb-12 pt-4 shrink-0">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-accent text-ink text-lg font-bold rounded-card shadow-card
                     transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          시작하기
        </button>
        <p className="text-xs text-muted text-center mt-3">
          로그인하여 나의 등산 기록을 저장하세요
        </p>
      </footer>
    </div>
  )
}
