import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, X, Mountain as MountainIcon, CheckCircle2, LocateFixed } from 'lucide-react'
import { useMountainStore } from '../store/mountainStore'
import type { Mountain } from '../types'
import BottomNav from '../components/BottomNav'

declare global {
  interface Window { mapboxgl: any }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const navigate = useNavigate()
  const { mountains, completedIds, fetchMountains, fetchCompletions } = useMountainStore()
  const [selected, setSelected] = useState<Mountain | null>(null)
  const [locating, setLocating] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [showUndone, setShowUndone] = useState(true)

  const handleLocate = () => {
    if (!mapInstanceRef.current || locating) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 10,
          duration: 1500,
        })
        setLocating(false)
      },
      () => {
        alert('위치 정보를 가져올 수 없어요')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (mountains.length === 0) { fetchMountains(); fetchCompletions() }
  }, [])

  useEffect(() => {
    if (!mapRef.current || mountains.length === 0 || !window.mapboxgl) return

    window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [127.9, 36.4],
        zoom: 6.5,
      })

      mapInstanceRef.current.addControl(
        new window.mapboxgl.NavigationControl(), 'top-right'
      )

      mapInstanceRef.current.on('click', () => setSelected(null))
    }

    // 기존 마커 제거
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // 산 마커 추가 (DOM 조작이라 토큰 대신 hex 유지)
    mountains.forEach(mountain => {
      if (!mountain.lat || !mountain.lng) return
      const done = completedIds.has(mountain.id)
      if (done && !showDone) return
      if (!done && !showUndone) return

      const el = document.createElement('div')
      if (done) {
        el.innerHTML = `<svg width="26" height="36" viewBox="0 0 26 36" fill="none">
          <circle cx="13" cy="24" r="7" fill="#34c46a" stroke="white" stroke-width="2"/>
          <line x1="13" y1="24" x2="13" y2="2" stroke="#1a3a5c" stroke-width="2" stroke-linecap="round"/>
          <path d="M14 3 L25 8 L14 13 Z" fill="#e63329"/>
        </svg>`
        el.style.cssText = 'cursor:pointer;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.3));transition:filter 0.15s;'
        el.onmouseenter = () => { el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.4)) brightness(1.05)' }
        el.onmouseleave = () => { el.style.filter = 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }
      } else {
        el.style.cssText = [
          'width:12px', 'height:12px', 'border-radius:50%',
          'background:white',
          'border:2.5px solid #5a7a9a',
          'box-shadow:0 1px 3px rgba(0,0,0,0.25)',
          'cursor:pointer',
          'transition:background 0.15s',
        ].join(';')
        el.onmouseenter = () => { el.style.background = '#e8f0f8' }
        el.onmouseleave = () => { el.style.background = 'white' }
      }
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelected(mountain)
      })

      const marker = new window.mapboxgl.Marker({
          element: el,
          anchor: done ? 'bottom-left' : 'center',
        })
        .setLngLat([mountain.lng, mountain.lat])
        .addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })
  }, [mountains, completedIds, showDone, showUndone])

  const done = selected ? completedIds.has(selected.id) : false
  const completedCount = completedIds.size

  return (
    <div className="relative flex flex-col h-screen">
      {/* 필터 바 */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 bg-surface/90 backdrop-blur-sm rounded-full px-1 py-1 shadow-pop flex items-center gap-0.5">
        <button
          onClick={() => setShowDone(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors
            ${showDone ? 'bg-success text-white' : 'text-faint'}`}
        >
          <div className={`w-2 h-2 rounded-full ${showDone ? 'bg-white' : 'bg-rule'}`} />
          완등 {completedCount}
        </button>
        <div className="w-px h-3 bg-rule" />
        <button
          onClick={() => setShowUndone(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors
            ${showUndone ? 'bg-ink-2 text-white' : 'text-faint'}`}
        >
          <div className={`w-2 h-2 rounded-full border-[1.5px] ${showUndone ? 'border-white' : 'border-rule'}`} />
          미완등 {mountains.length - completedCount}
        </button>
      </div>

      <div ref={mapRef} className="flex-1" />

      {/* GPS 버튼 */}
      <button
        onClick={handleLocate}
        disabled={locating}
        className="absolute bottom-20 right-4 z-10 w-10 h-10 bg-surface rounded-full shadow-pop flex items-center justify-center transition-opacity active:opacity-70 disabled:opacity-50"
      >
        <LocateFixed size={20} className={locating ? 'text-success animate-pulse' : 'text-ink'} />
      </button>

      {/* 선택된 산 카드 */}
      {selected && (
        <div className="absolute bottom-16 left-0 right-0 px-4 z-10 max-w-[430px] mx-auto">
          <div className="bg-surface rounded-card px-4 py-3.5 shadow-pop flex items-center gap-3">
            <div className={`w-10 h-10 rounded-field flex items-center justify-center shrink-0
              ${done ? 'bg-success-soft' : 'bg-paper'}`}>
              <MountainIcon size={20} className={done ? 'text-success' : 'text-ink-2'} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-ink truncate">{selected.name_ko}</p>
                {done && <CheckCircle2 size={14} fill="var(--color-success)" color="white" className="shrink-0" />}
              </div>
              <p className="text-xs text-muted">{selected.height}m · {selected.region}</p>
            </div>
            <button
              onClick={() => navigate(`/mountain/${selected.id}`)}
              className="p-1.5 text-ink-2 transition-opacity active:opacity-60"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setSelected(null)}
              className="p-1.5 text-faint transition-opacity active:opacity-60"
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
