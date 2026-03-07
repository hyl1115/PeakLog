import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMountainStore } from '../store/mountainStore'
import BottomNav from '../components/BottomNav'

const ORGS = ['산림청', 'BAC', '한국의산하', '월간산'] as const

const ORG_BAR_COLORS: Record<string, string> = {
  '산림청':    'bg-green-400',
  'BAC':       'bg-blue-400',
  '한국의산하': 'bg-orange-400',
  '월간산':    'bg-purple-400',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { mountains, completedIds, completionRecords, fetchMountains, fetchCompletions } = useMountainStore()

  useEffect(() => {
    fetchMountains()
    fetchCompletions()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  // 전체 진행률
  const totalUnique = mountains.length
  const totalCompleted = completedIds.size
  const totalPercent = totalUnique > 0 ? Math.round((totalCompleted / totalUnique) * 100) : 0

  // 기관별 진행률
  const orgStats = ORGS.map(org => {
    const orgMountains = mountains.filter(m => m.organizations.includes(org))
    const orgCompleted = orgMountains.filter(m => completedIds.has(m.id)).length
    return { org, total: orgMountains.length, completed: orgCompleted }
  })

  // 최근 완등 3개
  const recentMountains = completionRecords
    .slice(0, 3)
    .map(r => ({
      mountain: mountains.find(m => m.id === r.mountain_id),
      displayDate: r.hiked_date ?? r.completed_at,
      isHikedDate: !!r.hiked_date,
    }))
    .filter(r => r.mountain)

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f6ff]">
      {/* 헤더 */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl text-[#1a3a5c]" style={{ fontFamily: 'Jua, sans-serif' }}>
          PeakLog
        </h1>
        <button onClick={handleLogout} className="p-2 text-[#b0c8de] active:scale-90 transition-transform">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 pb-24">
        {/* 전체 진행률 카드 */}
        <div className="bg-[#1a3a5c] rounded-2xl p-5 text-white shadow-md">
          <p className="text-xs text-[#7aadda] mb-1">전체 완등 현황</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-4xl font-extrabold">{totalCompleted}</span>
              <span className="text-lg text-[#7aadda]"> / {totalUnique}</span>
            </div>
            <span className="text-3xl font-extrabold text-[#e63329]">{totalPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#0f2340] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e63329] rounded-full transition-all duration-700"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
          <p className="text-xs text-[#7aadda] mt-2">
            {totalUnique - totalCompleted}개 남았어요!
          </p>
        </div>

        {/* 기관별 진행률 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#1a3a5c] mb-4">기관별 진행률</p>
          <div className="flex flex-col gap-3">
            {orgStats.map(({ org, total, completed }) => {
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0
              return (
                <div key={org}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#5a7a9a]">{org}</span>
                    <span className="text-xs text-[#8aaac0]">{completed}/{total}</span>
                  </div>
                  <div className="w-full h-2 bg-[#f0f6ff] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${ORG_BAR_COLORS[org]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 최근 완등 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1a3a5c]">최근 완등</p>
            <button
              onClick={() => navigate('/list')}
              className="text-xs text-[#7aadda] flex items-center gap-0.5"
            >
              전체보기 <ChevronRight size={12} />
            </button>
          </div>
          {recentMountains.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-1">
              <p className="text-sm text-[#b0c8de]">아직 완등한 산이 없어요</p>
              <p className="text-xs text-[#dce8f5]">첫 번째 산을 정복해보세요!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentMountains.map(({ mountain, displayDate, isHikedDate }) => (
                <div
                  key={mountain!.id}
                  onClick={() => navigate(`/mountain/${mountain!.id}`)}
                  className="flex items-center gap-3 py-2 cursor-pointer active:opacity-70"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#f0faf4] flex items-center justify-center shrink-0">
                    <span className="text-lg">🏔️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1a3a5c]">{mountain!.name_ko}</p>
                    <p className="text-xs text-[#8aaac0]">{mountain!.height}m · {mountain!.region}</p>
                  </div>
                  <span className="text-xs text-[#b0c8de] shrink-0">
                    {isHikedDate
                      ? new Date(displayDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                      : new Date(displayDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
