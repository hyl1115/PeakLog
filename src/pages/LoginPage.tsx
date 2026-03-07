import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SAVED_EMAIL_KEY = 'peaklog_saved_email'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberEmail, setRememberEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_EMAIL_KEY)
    if (saved) {
      setEmail(saved)
      setRememberEmail(true)
    }
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요')
      return
    }
    setLoading(true)
    setError('')

    if (rememberEmail) {
      localStorage.setItem(SAVED_EMAIL_KEY, email)
    } else {
      localStorage.removeItem(SAVED_EMAIL_KEY)
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요')
      setLoading(false)
    } else {
      navigate('/home', { replace: true })
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#f0f6ff] px-6">
      <div className="flex flex-col items-center pt-16 pb-10">
        <h1
          className="text-4xl text-[#1a3a5c]"
          style={{ fontFamily: 'Jua, sans-serif', WebkitTextStroke: '1px #1a3a5c' }}
        >
          PeakLog
        </h1>
        <p className="text-sm text-[#5a7a9a] mt-1">나만의 100대 명산 등산 기록</p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#5a7a9a] pl-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            className="w-full px-4 py-4 bg-white rounded-2xl border border-[#dce8f5] text-sm text-[#1a3a5c] placeholder-[#b0c8de] outline-none focus:border-[#7aadda] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#5a7a9a] pl-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-4 bg-white rounded-2xl border border-[#dce8f5] text-sm text-[#1a3a5c] placeholder-[#b0c8de] outline-none focus:border-[#7aadda] transition-colors"
          />
        </div>

        <label className="flex items-center gap-2 pl-1 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberEmail}
            onChange={e => setRememberEmail(e.target.checked)}
            className="w-4 h-4 accent-[#e63329] cursor-pointer"
          />
          <span className="text-xs text-[#5a7a9a]">이메일 기억하기</span>
        </label>

        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-[#e63329] text-white text-lg rounded-2xl shadow-md active:scale-95 transition-transform disabled:opacity-60 mt-2"
          style={{ fontFamily: 'Jua, sans-serif' }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 text-xs text-[#b0c8de] text-center"
      >
        돌아가기
      </button>
    </div>
  )
}
