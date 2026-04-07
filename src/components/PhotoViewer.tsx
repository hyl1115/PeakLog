import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  photos: string[]
  initialIndex?: number
  onClose: () => void
}

export default function PhotoViewer({ photos, initialIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)

  const prev = () => setIndex(i => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex(i => (i + 1) % photos.length)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-12 right-4 p-2 text-white/80 active:scale-90 transition-transform z-10"
      >
        <X size={28} />
      </button>

      {photos.length > 1 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {index + 1} / {photos.length}
        </div>
      )}

      <img
        src={photos[index]}
        alt=""
        className="max-w-full max-h-[80vh] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/70 active:scale-90 transition-transform"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/70 active:scale-90 transition-transform"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
    </div>
  )
}
