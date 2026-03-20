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
    <div className="flex flex-col items-center justify-between h-screen bg-[#f0f6ff] px-6 py-12">
      <div className="flex flex-col items-center pt-8">
        <p className="text-sm tracking-widest text-[#7aadda] font-medium uppercase mb-1">Korea 100 Peaks</p>
        <h1
          className="text-6xl text-[#1a3a5c] tracking-tight"
          style={{
            fontFamily: 'Jua, sans-serif',
            WebkitTextStroke: '1.5px #1a3a5c',
          }}
        >
          PeakLog
        </h1>
        <p className="text-sm text-[#5a7a9a] mt-2">나만의 100대 명산 등산 기록</p>
      </div>

      <img
        src="/cover-character.png"
        alt="등산 캐릭터"
        className="w-72 h-72 object-contain drop-shadow-xl animate-float mix-blend-multiply"
      />

      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-[#e63329] text-white text-lg rounded-2xl shadow-md active:scale-95 transition-transform"
          style={{ fontFamily: 'Jua, sans-serif' }}
        >
          시작하기
        </button>
        <p className="text-xs text-[#8aaac0]">로그인하여 나의 등산 기록을 저장하세요</p>
      </div>
    </div>
  )
}
