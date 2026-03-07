import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Mountain } from 'lucide-react'
import { useRecordStore } from '../store/recordStore'
import { useMountainStore } from '../store/mountainStore'
import BottomNav from '../components/BottomNav'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function DiaryPage() {
  const navigate = useNavigate()
  const { records, fetchRecords } = useRecordStore()
  const { mountains, completionRecords, fetchMountains, fetchCompletions } = useMountainStore()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  useEffect(() => {
    fetchRecords()
    if (mountains.length === 0) { fetchMountains(); fetchCompletions() }
  }, [])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  // 달력 점 표시: records + completions 날짜 합산
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

  // 리스트: 기록 있으면 기록 우선, 없으면 completion 날짜로 표시
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
    <div className="flex flex-col min-h-screen bg-[#f0f6ff]">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <h1 className="text-xl text-[#1a3a5c]" style={{ fontFamily: 'Jua, sans-serif' }}>
          산행 기록
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 flex flex-col gap-4">
        {/* 달력 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-[#5a7a9a] active:scale-90 transition-transform">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-semibold text-[#1a3a5c]">{year}년 {month + 1}월</span>
            <button onClick={nextMonth} className="p-1 text-[#5a7a9a] active:scale-90 transition-transform">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-[#b0c8de] py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              const isHiked = day !== null && hikedDays.has(day)
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              return (
                <div key={i} className="flex flex-col items-center py-1">
                  {day !== null && (
                    <>
                      <span className={`text-xs w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday
                          ? 'bg-[#1a3a5c] text-white'
                          : isHiked
                            ? 'text-[#1a3a5c] font-bold'
                            : 'text-[#8aaac0]'}`}>
                        {day}
                      </span>
                      {isHiked && <div className="w-1.5 h-1.5 rounded-full bg-[#34c46a] mt-0.5" />}
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {monthHikedCount > 0 && (
            <p className="text-xs text-center text-[#8aaac0] mt-3 pt-3 border-t border-[#f0f6ff]">
              이번 달 <span className="text-[#34c46a] font-semibold">{monthHikedCount}개</span> 산 올랐어요!
            </p>
          )}
        </div>

        {/* 전체 기록 리스트 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {(() => {
            const total = recordsWithMountain.length + completionOnlyEntries.length
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

            return (
              <>
                <p className="text-sm font-semibold text-[#1a3a5c] mb-3">
                  전체 기록 <span className="text-[#b0c8de] font-normal text-xs ml-1">{total}개</span>
                </p>
                {total === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-2">
                    <p className="text-sm text-[#b0c8de]">아직 기록이 없어요</p>
                    <p className="text-xs text-[#dce8f5]">산 상세 페이지에서 기록을 남겨보세요</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-[#f0f6ff]">
                    {allEntries.map(entry => (
                      <div
                        key={entry.key}
                        onClick={() => navigate(`/mountain/${entry.mountainId}`)}
                        className="flex items-start gap-3 py-3 cursor-pointer active:opacity-70"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#f0faf4] flex items-center justify-center shrink-0">
                          <Mountain size={18} className="text-[#34c46a]" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm font-semibold text-[#1a3a5c] truncate">{entry.name}</p>
                            <span className="text-xs text-[#b0c8de] shrink-0">
                              {new Date(entry.date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {entry.isCompletionOnly ? (
                            <p className="text-xs text-[#dce8f5] mt-0.5">상세 기록을 남겨보세요</p>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mt-0.5">
                                {entry.weather && <span className="text-xs text-[#8aaac0]">{entry.weather}</span>}
                                {entry.companions && <span className="text-xs text-[#8aaac0]">· 👥 {entry.companions}</span>}
                              </div>
                              {entry.memo && (
                                <p className="text-xs text-[#b0c8de] mt-1 line-clamp-2">{entry.memo}</p>
                              )}
                              {entry.photoUrls?.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {entry.photoUrls.slice(0, 3).map(url => (
                                    <img key={url} src={url} alt="" className="w-14 h-14 rounded-lg object-cover" />
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

      <BottomNav />
    </div>
  )
}
