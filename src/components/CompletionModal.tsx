import { useState } from 'react'
import { X, Calendar, Check } from 'lucide-react'

interface Props {
  mountainName: string
  onConfirm: (hikedDate: string | null) => void
  onClose: () => void
}

export default function CompletionModal({ mountainName, onConfirm, onClose }: Props) {
  const [date, setDate] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[430px] bg-surface rounded-t-sheet px-6 pt-6 pb-10 shadow-pop">
        <div className="w-10 h-1 bg-rule rounded-full mx-auto mb-5" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-faint transition-opacity active:opacity-60"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-3xl mb-2">🏔️</span>
          <h2 className="text-lg font-bold text-ink">
            {mountainName} 완등!
          </h2>
          <p className="text-sm text-muted mt-1">언제 올라가셨나요?</p>
        </div>

        <div className="flex items-center gap-2 bg-paper rounded-card px-4 py-3.5 mb-4">
          <Calendar size={18} className="text-brand shrink-0" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="flex-1 bg-transparent text-sm text-ink outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="border-2 border-ink/12 rounded-full p-1.5">
            <button
              onClick={() => onConfirm(date || null)}
              className="w-full flex items-center justify-between bg-accent rounded-full pl-8 pr-1.5 py-1.5
                         transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              <span className="flex-1 text-center text-ink text-base font-bold">저장하기</span>
              <span className="w-11 h-11 bg-brand rounded-full flex items-center justify-center shrink-0">
                <Check size={18} className="text-white" strokeWidth={2.5} />
              </span>
            </button>
          </div>
          <button
            onClick={() => onConfirm(null)}
            className="w-full py-3.5 bg-paper text-muted text-sm rounded-card transition-opacity active:opacity-70"
          >
            날짜가 기억 안나요
          </button>
        </div>
      </div>
    </div>
  )
}
