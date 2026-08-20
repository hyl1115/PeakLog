import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Mountain } from 'lucide-react'
import { useRecordStore } from '../store/recordStore'
import { useMountainStore } from '../store/mountainStore'
import BottomNav from '../components/BottomNav'
import PhotoViewer from '../components/PhotoViewer'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function DiaryPage() {
  const navigate = useNavigate()
  const { records, fetchRecords } = useRecordStore()
  const { mountains, completionRecords, fetchMountains, fetchCompletions } = useMountainStore()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [viewerPhotos, setViewerPhotos] = useState<{ photos: string[], index: number } | null>(null)

  useEffect(() => {
    fetchRecords()
    if (mountains.length === 0) { fetchMountains(); fetchCompletions() }
  }, [])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  const recordDays = records
    .filter(r => r.hiked_date?.startsWith(monthStr))
    .map(r => parseInt(r.hiked_date!.split('-')[2]))
  const completionDays = completionRecords
    .filter(r => r.hiked_date?.startsWith(monthStr))
    .map(r => parseInt(r.hiked_date!.split('-')[2]))
  const hikedDays = new Set([...recordDays, ...completionDays])

  const monthHikedCount = new Set([
    ...records.filter(r => r.hiked_date?.startsWith(monthStr)).map(r => r.mountain_id),
    ...completionRecords.filter(r => r.hiked_date?.startsWith(monthStr)).map(r => r.mountain_id),
  ]).size

  const recordMountainIds = new Set(records.filter(r => r.hiked_date).map(r => r.mountain_id))
  const completionOnlyEntries = completionRecords
    .filter(r => r.hiked_date && !recordMountainIds.has(r.mountain_id))
    .map(r => ({ hiked_date: r.hiked_date!, mountain: mountains.find(m => m.id === r.mountain_id), isCompletionOnly: true, id: r.mountain_id }))
    .filter(r => r.mountain)

  const recordsWithMountain = records
    .filter(r => r.hiked_date)
    .map(r => ({ record: r, mountain: mountains.find(m => m.id === r.mountain_id), isCompletionOnly: false }))
    .filter(r => r.mountain)

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <div className="bg-surface px-4 pt-12 pb-4 shadow-card">
        <h1 className="text-xl font-bold text-ink">
          산행 기록
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 flex flex-col gap-5">
        {/* 달력 — 카드 유지 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-ink-2 transition-opacity active:opacity-60">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold text-ink">{year}년 {month + 1}월</span>
            <button onClick={nextMonth} className="p-1 text-ink-2 transition-opacity active:opacity-60">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-faint py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              const isHiked = day !== null && hikedDays.has(day)
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = day !== null && day === selectedDay
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center py-1 ${isHiked ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (isHiked) setSelectedDay(day === selectedDay ? null : day)
                  }}
                >
                  {day !== null && (
                    <>
                      <span className={`text-xs w-7 h-7 flex items-center justify-center rounded-full transition-colors
                        ${isSelected
                          ? 'bg-success text-white font-bold'
                          : isToday
                            ? 'bg-ink text-white'
                            : isHiked
                              ? 'text-ink font-bold'
                              : 'text-muted'}`}>
                        {day}
                      </span>
                      {isHiked && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-success mt-0.5" />}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {monthHikedCount > 0 && (
            <p className="text-xs text-center text-muted mt-3 pt-3 border-t border-paper">
              이번 달 <span className="text-success font-semibold">{monthHikedCount}개</span> 산 올랐어요!
            </p>
          )}
        </div>

        {/* 기록 리스트 — 카드 해체, 배경에 직접 */}
        <div>
          {(() => {
            const allEntries = [
              ...recordsWithMountain.map(e => ({
                key: e.record.id,
                mountainId: e.mountain!.id,
                name: e.mountain!.name_ko,
                date: e.record.hiked_date!,
                weather: e.record.weather,
                companions: e.record.companions,
                memo: e.record.memo,
                photoUrls: e.record.photo_urls,
                isCompletionOnly: false,
              })),
              ...completionOnlyEntries.map(e => ({
                key: e.id,
                mountainId: e.mountain!.id,
                name: e.mountain!.name_ko,
                date: e.hiked_date,
                weather: null,
                companions: null,
                memo: null,
                photoUrls: [] as string[],
                isCompletionOnly: true,
              })),
            ].sort((a, b) => b.date.localeCompare(a.date))

            const selectedDateStr = selectedDay
              ? `${monthStr}-${String(selectedDay).padStart(2, '0')}`
              : null
            const filtered = selectedDateStr
              ? allEntries.filter(e => e.date === selectedDateStr)
              : allEntries
            const total = filtered.length

            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-ink">
                    {selectedDay
                      ? `${month + 1}월 ${selectedDay}일 기록`
                      : '전체 기록'}
                    <span className="text-faint font-normal text-xs ml-1">{total}개</span>
                  </p>
                  {selectedDay && (
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-xs text-ink-2 transition-opacity active:opacity-60"
                    >
                      전체 보기
                    </button>
                  )}
                </div>
                {total === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <p className="text-sm text-faint">아직 기록이 없어요</p>
                    <p className="text-xs text-rule">산 상세 페이지에서 기록을 남겨보세요</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filtered.map(entry => (
                      <div
                        key={entry.key}
                        onClick={() => navigate(`/mountain/${entry.mountainId}`)}
                        className="flex items-start gap-3 py-3 px-3 rounded-card bg-surface shadow-card cursor-pointer transition-colors active:bg-sunken"
                      >
                        <div className="w-10 h-10 rounded-field bg-success-soft flex items-center justify-center shrink-0">
                          <Mountain size={18} className="text-success" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-semibold text-ink truncate">{entry.name}</p>
                            <span className="text-xs text-faint shrink-0">
                              {new Date(entry.date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {entry.isCompletionOnly ? (
                            <p className="text-xs text-rule mt-0.5">상세 기록을 남겨보세요</p>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mt-0.5">
                                {entry.weather && <span className="text-xs text-muted">{entry.weather}</span>}
                                {entry.companions && <span className="text-xs text-muted">· 👥 {entry.companions}</span>}
                              </div>
                              {entry.memo && (
                                <p className="text-xs text-faint mt-1 line-clamp-2">{entry.memo}</p>
                              )}
                              {entry.photoUrls?.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {entry.photoUrls.slice(0, 3).map((url, i) => (
                                    <img
                                      key={url}
                                      src={url}
                                      alt=""
                                      className="w-14 h-14 rounded-field object-cover cursor-pointer transition-opacity active:opacity-80"
                                      onClick={(e) => { e.stopPropagation(); setViewerPhotos({ photos: entry.photoUrls, index: i }) }}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {viewerPhotos && (
        <PhotoViewer
          photos={viewerPhotos.photos}
          initialIndex={viewerPhotos.index}
          onClose={() => setViewerPhotos(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}
