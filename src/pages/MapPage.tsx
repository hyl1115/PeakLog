import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, X, Mountain as MountainIcon, CheckCircle2 } from 'lucide-react'
import { useMountainStore } from '../store/mountainStore'
import type { Mountain } from '../types'
import BottomNav from '../components/BottomNav'

declare global {
  interface Window { kakao: any }
}

function loadKakaoScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.kakao?.maps) { resolve(); return }

    const existing = document.getElementById('kakao-map-script')
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(resolve))
      return
    }

    const script = document.createElement('script')
    script.id = 'kakao-map-script'
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    document.head.appendChild(script)
  })
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const overlaysRef = useRef<any[]>([])
  const setSelectedRef = useRef<(m: Mountain | null) => void>(() => {})
  const navigate = useNavigate()
  const { mountains, completedIds, fetchMountains, fetchCompletions } = useMountainStore()
  const [selected, setSelected] = useState<Mountain | null>(null)

  setSelectedRef.current = setSelected

  useEffect(() => {
    if (mountains.length === 0) { fetchMountains(); fetchCompletions() }
  }, [])

  useEffect(() => {
    if (!mapRef.current || mountains.length === 0) return

    loadKakaoScript().then(() => {
      if (!mapRef.current) return

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(36.4, 127.9),
          level: 13,
        })
        window.kakao.maps.event.addListener(mapInstanceRef.current, 'click', () => {
          setSelectedRef.current(null)
        })
      }

      overlaysRef.current.forEach(o => o.setMap(null))
      overlaysRef.current = []

      mountains.forEach(mountain => {
        if (!mountain.lat || !mountain.lng) return
        const done = completedIds.has(mountain.id)

        const el = document.createElement('div')
        el.style.cssText = [
          'width:12px', 'height:12px', 'border-radius:50%',
          `background:${done ? '#34c46a' : 'rgba(26,58,92,0.2)'}`,
          `border:2px solid ${done ? '#2da85a' : '#1a3a5c'}`,
          'box-shadow:0 1px 3px rgba(0,0,0,0.25)',
          'cursor:pointer',
          'transition:transform 0.15s',
        ].join(';')
        el.onmouseenter = () => { el.style.transform = 'scale(1.6)' }
        el.onmouseleave = () => { el.style.transform = 'scale(1)' }
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setSelectedRef.current(mountain)
        })

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(mountain.lat, mountain.lng),
          content: el,
          map: mapInstanceRef.current,
          zIndex: done ? 2 : 1,
        })
        overlaysRef.current.push(overlay)
      })
    })
  }, [mountains, completedIds])

  const done = selected ? completedIds.has(selected.id) : false
  const completedCount = completedIds.size

  return (
    <div className="relative flex flex-col h-screen">
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#34c46a]" />
        <span className="text-xs font-medium text-[#1a3a5c]">완등 {completedCount}</span>
        <div className="w-px h-3 bg-[#e8f0f8]" />
        <div className="w-2 h-2 rounded-full border-2 border-[#1a3a5c] bg-transparent" />
        <span className="text-xs font-medium text-[#1a3a5c]">미완등 {mountains.length - completedCount}</span>
      </div>

      <div ref={mapRef} className="flex-1" />

      {selected && (
        <div className="absolute bottom-16 left-0 right-0 px-4 z-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-4 py-3.5 shadow-xl flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${done ? 'bg-[#f0faf4]' : 'bg-[#f0f6ff]'}`}>
              <MountainIcon size={20} className={done ? 'text-[#34c46a]' : 'text-[#5a7a9a]'} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[#1a3a5c] truncate">{selected.name_ko}</p>
                {done && <CheckCircle2 size={14} fill="#34c46a" color="white" className="shrink-0" />}
              </div>
              <p className="text-xs text-[#8aaac0]">{selected.height}m · {selected.region}</p>
            </div>
            <button
              onClick={() => navigate(`/mountain/${selected.id}`)}
              className="p-1.5 text-[#5a7a9a] active:scale-90 transition-transform"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setSelected(null)}
              className="p-1.5 text-[#b0c8de] active:scale-90 transition-transform"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
