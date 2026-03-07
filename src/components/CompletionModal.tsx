import { useState } from 'react'
import { X, Calendar } from 'lucide-react'

interface Props {
  mountainName: string
  onConfirm: (hikedDate: string | null) => void
  onClose: () => void
}

export default function CompletionModal({ mountainName, onConfirm, onClose }: Props) {
  const [date, setDate] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 배경 딤 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div className="relative w-full max-w-[430px] bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-xl">
        {/* 핸들 */}
        <div className="w-10 h-1 bg-[#e8f0f8] rounded-full mx-auto mb-5" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#b0c8de] active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-3xl mb-2">🏔️</span>
          <h2 className="text-lg font-bold text-[#1a3a5c]" style={{ fontFamily: 'Jua, sans-serif' }}>
            {mountainName} 완등!
          </h2>
          <p className="text-sm text-[#8aaac0] mt-1">언제 올라가셨나요?</p>
        </div>

        {/* 날짜 입력 */}
        <div className="flex items-center gap-2 bg-[#f0f6ff] rounded-2xl px-4 py-3.5 mb-4">
          <Calendar size={18} className="text-[#7aadda] shrink-0" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="flex-1 bg-transparent text-sm text-[#1a3a5c] outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onConfirm(date || null)}
            className="w-full py-4 bg-[#e63329] text-white text-base rounded-2xl shadow-md active:scale-95 transition-transform"
            style={{ fontFamily: 'Jua, sans-serif' }}
          >
            저장하기
          </button>
          <button
            onClick={() => onConfirm(null)}
            className="w-full py-3.5 bg-[#f0f6ff] text-[#8aaac0] text-sm rounded-2xl active:scale-95 transition-transform"
          >
            날짜가 기억 안나요
          </button>
        </div>
      </div>
    </div>
  )
}
