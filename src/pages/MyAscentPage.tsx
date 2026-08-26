import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMountainStore } from '../store/mountainStore'
import BottomNav from '../components/BottomNav'

const EVEREST_HEIGHT = 8_849

export default function MyAscentPage() {
  const navigate = useNavigate()
  const { mountains, completionRecords, fetchMountains, fetchCompletions } =
    useMountainStore()

  useEffect(() => {
    if (mountains.length === 0) fetchMountains()
    fetchCompletions()
  }, [])

  /* ── 데이터 계산 ── */
  const totalPossible = mountains.reduce((s, m) => s + m.height, 0)

  // 완등한 산 목록 — 날짜순 (최신이 위)
  const completedSteps = completionRecords
    .map(r => {
      const mt = mountains.find(m => m.id === r.mountain_id)
      if (!mt) return null
      const displayDate = r.hiked_date ?? r.completed_at
      const dateStr = r.hiked_date
        ? new Date(r.hiked_date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
        : new Date(r.completed_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
      return { mountain: mt, dateStr, rawDate: displayDate }
    })
    .filter(Boolean) as { mountain: { id: string; name_ko: string; height: number; region: string }; dateStr: string; rawDate: string }[]

  const cumulativeAlt = completedSteps.reduce((s, step) => s + step.mountain.height, 0)
  const everestCount = (cumulativeAlt / EVEREST_HEIGHT).toFixed(1)
  const totalCount = completedSteps.length
  const totalMountains = mountains.length
  const percent = totalMountains > 0 ? Math.round((totalCount / totalMountains) * 100) : 0
  const remaining = totalMountains - totalCount

  // 마일스톤 (25% 단위)
  const nextMilestonePercent =
    percent < 25 ? 25 : percent < 50 ? 50 : percent < 75 ? 75 : 100
  const nextMilestoneAlt = Math.ceil(totalPossible * (nextMilestonePercent / 100))
  const toNextMilestone = Math.max(0, nextMilestoneAlt - cumulativeAlt)

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* 배경 그라데이션 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, oklch(96.5% 0.015 160) 0%, oklch(92% 0.025 160) 35%, oklch(86% 0.035 160) 65%, oklch(78% 0.045 160) 100%)',
        }}
      />

      {/* 산 배경 실루엣 — 5층 */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 375 812"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <path
          d="M-10,280 L40,210 L75,245 L120,185 L170,220 L215,165 L265,200 L310,175 L350,195 L385,180 L385,812 L-10,812Z"
          fill="var(--color-faint)" opacity="0.5"
        />
        <path
          d="M-10,370 L35,305 L80,340 L135,280 L185,315 L235,265 L285,300 L330,278 L385,295 L385,812 L-10,812Z"
          fill="var(--color-muted)" opacity="0.4"
        />
        <path
          d="M-10,460 L50,400 L95,430 L155,375 L210,410 L265,365 L315,395 L360,378 L385,390 L385,812 L-10,812Z"
          fill="var(--color-brand)" opacity="0.35"
        />
        <path
          d="M-10,560 L45,520 L100,545 L160,505 L220,535 L275,510 L335,530 L385,518 L385,812 L-10,812Z"
          fill="var(--color-ink-2)" opacity="0.3"
        />
        <path
          d="M-10,650 L55,620 L120,640 L185,615 L250,635 L315,618 L370,632 L385,625 L385,812 L-10,812Z"
          fill="var(--color-ink)" opacity="0.25"
        />
      </svg>

      {/* 콘텐츠 */}
      <div className="relative z-10 flex-1 overflow-y-auto pb-24">
        {/* 상단 요약 카드 */}
        <div className="mx-4 mt-14 bg-ink rounded-sheet p-5 text-white shadow-pop overflow-hidden relative">
          <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-brand/15" />
          <p className="text-[11px] text-[#a8d4be] mb-1">누적 등반 고도</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[32px] font-extrabold leading-none">
              {cumulativeAlt.toLocaleString()}
            </span>
            <span className="text-sm text-white/55">m</span>
            <span className="text-xs text-white/40 ml-1">
              / {totalPossible.toLocaleString()}m
            </span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div className="bg-brand/25 rounded-full px-3 py-1 mt-2 inline-flex items-center gap-1">
              <span className="text-xs">⛰️</span>
              <span className="text-xs font-semibold text-[#a8d4be]">
                에베레스트 {everestCount}회 등정!
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-[#a8d4be]">{totalCount}</span>
              <span className="text-xs text-white/50"> / {totalMountains}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-[11px] text-white/50 mt-1.5">
            {remaining}개 남았어요! 다음 마일스톤까지 {toNextMilestone.toLocaleString()}m
          </p>
        </div>

        {/* 마일스톤 표시 */}
        {percent < 100 && (
          <div className="flex items-center gap-2 mx-4 mt-3 mb-1">
            <span className="text-base">🚩</span>
            <span className="text-[11px] font-semibold text-brand">
              {nextMilestonePercent}% · {nextMilestoneAlt.toLocaleString()}m
            </span>
            <div className="flex-1 h-px bg-brand/30" />
          </div>
        )}

        {/* 계단 영역 */}
        <div className="px-6 pt-2">
          <p className="text-xs font-semibold text-ink-2 flex items-center gap-1.5 mb-2">
            <span>🏔️</span> 완등한 산
          </p>

          {completedSteps.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <p className="text-sm text-faint">아직 완등한 산이 없어요</p>
              <p className="text-xs text-rule">첫 번째 산을 정복해보세요!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {completedSteps.map((step, i) => {
                const isFirst = i === 0
                const isLeft = i % 2 === 1
                const opacity = Math.max(0.45, 1 - i * 0.06)

                return (
                  <div key={step.mountain.id}>
                    {/* 커넥터 */}
                    {i > 0 && (
                      <div
                        className="h-3.5"
                        style={{
                          display: 'flex',
                          justifyContent: isLeft ? 'flex-start' : 'flex-end',
                          paddingLeft: isLeft ? '40px' : undefined,
                          paddingRight: !isLeft ? '40px' : undefined,
                        }}
                      >
                        <div className="w-0.5 h-full bg-brand/20 rounded-full" />
                      </div>
                    )}

                    {/* 계단 스텝 */}
                    <div
                      className={`flex ${isLeft ? 'pr-[28%]' : 'pl-[28%]'}`}
                      style={{ opacity }}
                    >
                      <button
                        onClick={() => navigate(`/mountain/${step.mountain.id}`)}
                        className={`
                          w-full h-9 rounded-md flex items-center px-3 gap-2
                          backdrop-blur-sm transition-colors active:bg-sunken/80
                          ${isFirst
                            ? 'bg-surface/95 border-2 border-brand shadow-card'
                            : 'bg-surface/85 border border-rule/70'
                          }
                        `}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isFirst ? 'bg-brand shadow-[0_0_0_3px_rgba(90,154,122,0.2)]' : 'bg-success'
                          }`}
                        />
                        <span className="text-[11px] font-semibold text-ink truncate">
                          {step.mountain.name_ko}
                        </span>
                        <span className="text-[10px] text-muted">
                          {step.mountain.height.toLocaleString()}m
                        </span>
                        <span className="text-[9px] text-faint ml-auto shrink-0">
                          {step.dateStr}
                        </span>
                      </button>
                    </div>

                    {/* 캐릭터: 최상단 FRONT / 1칸 아래 SIDE / 2칸 아래 BACK */}
                    {i <= 2 && (
                      <div
                        className={`flex ${isLeft ? 'pr-[28%]' : 'pl-[28%]'} ${isFirst ? '-mt-12 mb-3' : '-mt-10 mb-2'} pointer-events-none`}
                        style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}
                      >
                        <div className="relative" style={{ marginRight: isLeft ? undefined : '8px', marginLeft: isLeft ? '8px' : undefined }}>
                          <img
                            src={
                              isFirst
                                ? '/climb-character-front.png'
                                : i === 1
                                  ? '/climb-character-side.png'
                                  : '/climb-character-back.png'
                            }
                            alt="등반 캐릭터"
                            className={`object-contain drop-shadow-md ${
                              isFirst
                                ? 'w-11 h-11 animate-float'
                                : i === 1
                                  ? `w-9 h-9 opacity-50 ${isLeft ? '' : 'scale-x-[-1]'}`
                                  : 'w-8 h-8 opacity-30'
                            }`}
                            onError={(e) => {
                              const el = e.currentTarget
                              el.style.display = 'none'
                              el.parentElement!.innerHTML = isFirst
                                ? '<span class="text-2xl animate-float" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.15))">🧗</span>'
                                : ''
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* 시작점 */}
              <div className="text-center py-3">
                <span className="text-[11px] font-semibold text-brand">🏁 시작</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
