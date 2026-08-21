import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMountainStore } from '../store/mountainStore'
import BottomNav from '../components/BottomNav'

const ORGS = ['산림청', 'BAC', '한국의산하', '월간산'] as const

const ORG_BAR_COLORS: Record<string, string> = {
  '산림청':    'bg-brand',
  'BAC':       'bg-ink-2',
  '한국의산하': 'bg-faint',
  '월간산':    'bg-muted',
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

  const totalUnique = mountains.length
  const totalCompleted = completedIds.size
  const totalPercent = totalUnique > 0 ? Math.round((totalCompleted / totalUnique) * 100) : 0

  const orgStats = ORGS.map(org => {
    const orgMountains = mountains.filter(m => m.organizations.includes(org))
    const orgCompleted = orgMountains.filter(m => completedIds.has(m.id)).length
    return { org, total: orgMountains.length, completed: orgCompleted }
  })

  const recentMountains = completionRecords
    .slice(0, 3)
    .map(r => ({
      mountain: mountains.find(m => m.id === r.mountain_id),
      displayDate: r.hiked_date ?? r.completed_at,
      isHikedDate: !!r.hiked_date,
    }))
    .filter(r => r.mountain)

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      {/* 헤더 */}
      <div className="bg-surface px-4 pt-12 pb-4 shadow-card flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-ink">
          PeakLog
        </h1>
        <button onClick={handleLogout} className="p-2 text-faint transition-opacity active:opacity-60">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-6 px-4 py-5 pb-24">
        {/* 전체 진행률 히어로 */}
        <div className="bg-ink rounded-sheet p-5 text-white shadow-pop">
          <p className="text-xs text-[#a8d4be] mb-1">전체 완등 현황</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-4xl font-extrabold">{totalCompleted}</span>
              <span className="text-lg text-white/55"> / {totalUnique}</span>
            </div>
            <span className="text-3xl font-extrabold text-[#a8d4be]">{totalPercent}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-700"
              style={{ width: `${totalPercent}%` }}
            />
          </div>
          <p className="text-xs text-white/60 mt-2">
            {totalUnique - totalCompleted}개 남았어요!
          </p>
        </div>

        {/* 기관별 진행률 — 카드 해체 */}
        <section>
          <p className="text-sm font-semibold text-ink mb-3">기관별 진행률</p>
          <div className="flex flex-col gap-3">
            {orgStats.map(({ org, total, completed }) => {
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0
              return (
                <div key={org}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-ink-2">{org}</span>
                    <span className="text-xs text-muted">{completed}/{total}</span>
                  </div>
                  <div className="w-full h-2 bg-rule rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${ORG_BAR_COLORS[org]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 최근 완등 — 카드 해체 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">최근 완등</p>
            <button
              onClick={() => navigate('/list')}
              className="text-xs text-brand flex items-center gap-0.5 transition-opacity active:opacity-60"
            >
              전체보기 <ChevronRight size={12} />
            </button>
          </div>
          {recentMountains.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-1">
              <p className="text-sm text-faint">아직 완등한 산이 없어요</p>
              <p className="text-xs text-rule">첫 번째 산을 정복해보세요!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentMountains.map(({ mountain, displayDate, isHikedDate }) => (
                <div
                  key={mountain!.id}
                  onClick={() => navigate(`/mountain/${mountain!.id}`)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-card bg-surface shadow-card cursor-pointer transition-colors active:bg-sunken"
                >
                  <div className="w-9 h-9 rounded-field bg-success-soft flex items-center justify-center shrink-0">
                    <span className="text-lg">🏔️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{mountain!.name_ko}</p>
                    <p className="text-xs text-muted">{mountain!.height}m · {mountain!.region}</p>
                  </div>
                  <span className="text-xs text-faint shrink-0">
                    {isHikedDate
                      ? new Date(displayDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                      : new Date(displayDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
