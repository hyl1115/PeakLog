import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Mountain, CheckCircle2, Circle, BookOpen, Pencil } from 'lucide-react'
import { useMountainStore } from '../store/mountainStore'
import { useRecordStore } from '../store/recordStore'
import { ORG_COLORS } from '../types'
import CompletionModal from '../components/CompletionModal'
import PhotoViewer from '../components/PhotoViewer'

export default function MountainDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { mountains, completedIds, completionRecords, fetchMountains, fetchCompletions, toggleCompletion } = useMountainStore()
  const { records, fetchRecords } = useRecordStore()
  const [showModal, setShowModal] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  useEffect(() => {
    if (mountains.length === 0) {
      fetchMountains()
      fetchCompletions()
    }
    fetchRecords()
  }, [])

  const mountain = mountains.find(m => m.id === id)
  const done = mountain ? completedIds.has(mountain.id) : false
  const record = completionRecords.find(r => r.mountain_id === id)
  const hikingRecord = records.find(r => r.mountain_id === id)

  const handleCheckClick = () => {
    if (done) {
      toggleCompletion(mountain!.id)
    } else {
      setShowModal(true)
    }
  }

  const handleModalConfirm = (hikedDate: string | null) => {
    if (mountain) toggleCompletion(mountain.id, hikedDate)
    setShowModal(false)
  }

  if (!mountain) {
    return (
      <div className="flex items-center justify-center h-screen bg-paper">
        <p className="text-sm text-faint">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      {/* 헤더 — 좌측 정렬 */}
      <div className="relative bg-surface px-4 pt-12 pb-5 shadow-card">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-ink-2 mb-3 transition-opacity active:opacity-60"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="flex items-start gap-4">
          {/* 아이콘 — 좌측 배치, 작게 */}
          <div className={`w-14 h-14 rounded-card flex items-center justify-center shrink-0 shadow-card
            ${done ? 'bg-brand' : 'bg-ink'}`}>
            <Mountain size={28} color="white" strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-ink leading-tight">
              {mountain.name_ko}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted">
              <span className="flex items-center gap-0.5">
                <Mountain size={12} />
                {mountain.height}m
              </span>
              <span className="w-1 h-1 rounded-full bg-rule" />
              <span className="flex items-center gap-0.5">
                <MapPin size={12} />
                {mountain.region}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {mountain.organizations.map(org => (
                <span key={org} className={`text-xs px-2 py-0.5 rounded-field font-medium ${ORG_COLORS[org]}`}>
                  {org}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5">
        {/* 완등 체크 */}
        <button
          onClick={handleCheckClick}
          className={`w-full py-4 rounded-card flex flex-col items-center justify-center gap-1 shadow-card active:scale-[0.97] transition-all
            ${done ? 'bg-brand' : 'bg-surface border-2 border-dashed border-rule'}`}
        >
          {done ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={22} fill="white" color="var(--color-success)" />
                <span className="text-lg font-bold text-white">완등했어요!</span>
              </div>
              {record?.hiked_date && (
                <span className="text-xs text-white/80">
                  {new Date(record.hiked_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Circle size={22} className="text-faint" />
              <span className="text-lg font-bold text-faint">완등 체크하기</span>
            </div>
          )}
        </button>

        {/* 기록 섹션 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-ink-2" />
              <span className="text-sm font-semibold text-ink">나의 산행 기록</span>
            </div>
            <button
              onClick={() => navigate(`/record/${mountain.id}`)}
              className="flex items-center gap-1 text-xs text-brand transition-opacity active:opacity-60"
            >
              <Pencil size={13} />
              {hikingRecord ? '수정' : '기록 남기기'}
            </button>
          </div>

          {hikingRecord ? (
            <div className="flex flex-col gap-2">
              {hikingRecord.hiked_date && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-faint w-14 shrink-0">날짜</span>
                  <span className="text-ink">
                    {new Date(hikingRecord.hiked_date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
              {hikingRecord.weather && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-faint w-14 shrink-0">날씨</span>
                  <span className="text-ink">{hikingRecord.weather}</span>
                </div>
              )}
              {hikingRecord.companions && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-faint w-14 shrink-0">동행인</span>
                  <span className="text-ink">{hikingRecord.companions}</span>
                </div>
              )}
              {hikingRecord.memo && (
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-xs text-faint">메모</span>
                  <p className="text-sm text-ink leading-relaxed">{hikingRecord.memo}</p>
                </div>
              )}
              {hikingRecord.photo_urls?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {hikingRecord.photo_urls.map((url, i) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="w-24 h-24 rounded-field object-cover cursor-pointer transition-opacity active:opacity-80"
                      onClick={() => setViewerIndex(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-2">
              <p className="text-sm text-faint">아직 기록이 없어요</p>
              <p className="text-xs text-rule">날짜, 날씨, 동행인, 사진을 남겨보세요</p>
            </div>
          )}
        </div>

        {/* 포함 기관 — 간소화 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <p className="text-sm font-semibold text-ink mb-3">포함된 100대 명산 리스트</p>
          <div className="flex flex-col gap-2">
            {['산림청', 'BAC', '한국의산하', '월간산'].map(org => {
              const included = mountain.organizations.includes(org)
              return (
                <div key={org} className="flex items-center justify-between py-1">
                  <span className={`text-sm ${included ? 'text-ink font-medium' : 'text-rule'}`}>
                    {org} 100대 명산
                  </span>
                  {included
                    ? <CheckCircle2 size={18} fill="var(--color-success)" color="white" />
                    : <Circle size={18} className="text-sunken" />
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {viewerIndex !== null && hikingRecord?.photo_urls && (
        <PhotoViewer
          photos={hikingRecord.photo_urls}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      {showModal && (
        <CompletionModal
          mountainName={mountain.name_ko}
          onConfirm={handleModalConfirm}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
