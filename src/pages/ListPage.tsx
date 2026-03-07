import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CheckCircle2, Circle, ArrowUpDown, ChevronRight } from 'lucide-react'
import { useMountainStore } from '../store/mountainStore'
import { ORG_LIST, ORG_COLORS, type OrgFilter } from '../types'
import BottomNav from '../components/BottomNav'
import CompletionModal from '../components/CompletionModal'
import type { Mountain } from '../types'

type SortMode = 'alpha' | 'unvisited'

export default function ListPage() {
  const navigate = useNavigate()
  const { mountains, completedIds, loading, fetchMountains, fetchCompletions, toggleCompletion } = useMountainStore()
  const [activeTab, setActiveTab] = useState<OrgFilter>('전체')
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('alpha')
  const [pendingMountain, setPendingMountain] = useState<Mountain | null>(null)

  useEffect(() => {
    fetchMountains()
    fetchCompletions()
  }, [])

  const handleCheckClick = (e: React.MouseEvent, mountain: Mountain) => {
    e.stopPropagation()
    if (completedIds.has(mountain.id)) {
      toggleCompletion(mountain.id)
    } else {
      setPendingMountain(mountain)
    }
  }

  const handleModalConfirm = (hikedDate: string | null) => {
    if (pendingMountain) toggleCompletion(pendingMountain.id, hikedDate)
    setPendingMountain(null)
  }

  const filtered = mountains
    .filter(m => {
      const matchOrg = activeTab === '전체' || m.organizations.includes(activeTab)
      const matchSearch = m.name_ko.includes(search) || m.region.includes(search)
      return matchOrg && matchSearch
    })
    .sort((a, b) => {
      if (sortMode === 'unvisited') {
        const aDone = completedIds.has(a.id) ? 1 : 0
        const bDone = completedIds.has(b.id) ? 1 : 0
        if (aDone !== bDone) return aDone - bDone
      }
      return a.name_ko.localeCompare(b.name_ko, 'ko')
    })

  const total = activeTab === '전체'
    ? mountains.length
    : mountains.filter(m => m.organizations.includes(activeTab)).length
  const completed = mountains
    .filter(m => (activeTab === '전체' || m.organizations.includes(activeTab)) && completedIds.has(m.id))
    .length

  return (
    <div className="flex flex-col h-screen bg-[#f0f6ff]">
      <div className="bg-white px-4 pt-12 pb-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl text-[#1a3a5c]" style={{ fontFamily: 'Jua, sans-serif' }}>
            100대 명산
          </h1>
          <button
            onClick={() => setSortMode(s => s === 'alpha' ? 'unvisited' : 'alpha')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${sortMode === 'unvisited'
                ? 'bg-[#1a3a5c] text-white'
                : 'bg-[#e8f0f8] text-[#5a7a9a]'}`}
          >
            <ArrowUpDown size={12} />
            {sortMode === 'unvisited' ? '미완등 먼저' : '가나다순'}
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#f0f6ff] rounded-xl px-3 py-2.5 mb-3">
          <Search size={16} className="text-[#b0c8de]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="산 이름, 지역으로 검색"
            className="flex-1 bg-transparent text-sm text-[#1a3a5c] placeholder-[#b0c8de] outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {ORG_LIST.map(org => (
            <button
              key={org}
              onClick={() => setActiveTab(org)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${activeTab === org
                  ? 'bg-[#1a3a5c] text-white'
                  : 'bg-[#e8f0f8] text-[#5a7a9a]'}`}
            >
              {org}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-xs text-[#5a7a9a] shrink-0">
          {activeTab === '전체' ? '전체' : activeTab} {completed}/{total}
        </span>
        <div className="flex-1 h-1.5 bg-[#dce8f5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e63329] rounded-full transition-all duration-500"
            style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-xs font-medium text-[#e63329] shrink-0">
          {total > 0 ? Math.round((completed / total) * 100) : 0}%
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#b0c8de]">불러오는 중...</p>
          </div>
        ) : (
          filtered.map(mountain => {
            const done = completedIds.has(mountain.id)
            return (
              <div
                key={mountain.id}
                onClick={() => navigate(`/mountain/${mountain.id}`)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 shadow-sm transition-all cursor-pointer active:scale-[0.98]
                  ${done ? 'bg-[#f0faf4]' : 'bg-white'}`}
              >
                <button
                  onClick={e => handleCheckClick(e, mountain)}
                  className="shrink-0 active:scale-90 transition-transform"
                >
                  {done
                    ? <CheckCircle2 size={26} fill="#34c46a" color="white" />
                    : <Circle size={26} className="text-[#dce8f5]" />
                  }
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-semibold text-base ${done ? 'text-[#34c46a]' : 'text-[#1a3a5c]'}`}>
                      {mountain.name_ko}
                    </span>
                    <span className="text-xs text-[#b0c8de]">{mountain.height}m</span>
                  </div>
                  <p className="text-xs text-[#8aaac0] mt-0.5 truncate">{mountain.region}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {mountain.organizations.map(org => (
                      <span key={org} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ORG_COLORS[org]}`}>
                        {org}
                      </span>
                    ))}
                  </div>
                </div>

                <ChevronRight size={16} className="text-[#dce8f5] shrink-0" />
              </div>
            )
          })
        )}
      </div>

      <BottomNav />

      {pendingMountain && (
        <CompletionModal
          mountainName={pendingMountain.name_ko}
          onConfirm={handleModalConfirm}
          onClose={() => setPendingMountain(null)}
        />
      )}
    </div>
  )
}
