import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Mountain, CheckCircle2, Circle, BookOpen, Pencil } from 'lucide-react'
import { useMountainStore } from '../store/mountainStore'
import { useRecordStore } from '../store/recordStore'
import { ORG_COLORS } from '../types'
import CompletionModal from '../components/CompletionModal'

export default function MountainDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { mountains, completedIds, completionRecords, fetchMountains, fetchCompletions, toggleCompletion } = useMountainStore()
  const { records, fetchRecords } = useRecordStore()
  const [showModal, setShowModal] = useState(false)

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
      <div className="flex items-center justify-center h-screen bg-[#f0f6ff]">
        <p className="text-sm text-[#b0c8de]">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f6ff]">
      <div className="relative bg-white px-4 pt-12 pb-6 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 p-1 text-[#5a7a9a] active:scale-90 transition-transform"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="flex flex-col items-center pt-2">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-md
            ${done ? 'bg-[#34c46a]' : 'bg-[#1a3a5c]'}`}>
            <Mountain size={40} color="white" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl text-[#1a3a5c]" style={{ fontFamily: 'Jua, sans-serif' }}>
            {mountain.name_ko}
          </h1>

          <div className="flex items-center gap-3 mt-2 text-sm text-[#8aaac0]">
            <span className="flex items-center gap-1">
              <Mountain size={13} />
              {mountain.height}m
            </span>
            <span className="w-1 h-1 rounded-full bg-[#dce8f5]" />
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {mountain.region}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {mountain.organizations.map(org => (
              <span key={org} className={`text-xs px-2.5 py-1 rounded-full font-medium ${ORG_COLORS[org]}`}>
                {org}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5">
        {/* 완등 체크 버튼 */}
        <button
          onClick={handleCheckClick}
          className={`w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all
            ${done ? 'bg-[#34c46a]' : 'bg-white border-2 border-dashed border-[#dce8f5]'}`}
        >
          {done ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={24} fill="white" color="#34c46a" />
                <span className="text-lg font-bold text-white" style={{ fontFamily: 'Jua, sans-serif' }}>완등했어요!</span>
              </div>
              {record?.hiked_date && (
                <span className="text-xs text-white/80">
                  {new Date(record.hiked_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Circle size={24} className="text-[#b0c8de]" />
              <span className="text-lg font-bold text-[#b0c8de]" style={{ fontFamily: 'Jua, sans-serif' }}>완등 체크하기</span>
            </div>
          )}
        </button>

        {/* 기록 섹션 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#5a7a9a]" />
              <span className="text-sm font-semibold text-[#1a3a5c]">나의 산행 기록</span>
            </div>
            <button
              onClick={() => navigate(`/record/${mountain.id}`)}
              className="flex items-center gap-1 text-xs text-[#7aadda] active:scale-90 transition-transform"
            >
              <Pencil size={13} />
              {hikingRecord ? '수정' : '기록 남기기'}
            </button>
          </div>

          {hikingRecord ? (
            <div className="flex flex-col gap-2">
              {hikingRecord.hiked_date && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#b0c8de] w-14 shrink-0">날짜</span>
                  <span className="text-[#1a3a5c]">
                    {new Date(hikingRecord.hiked_date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
              {hikingRecord.weather && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#b0c8de] w-14 shrink-0">날씨</span>
                  <span className="text-[#1a3a5c]">{hikingRecord.weather}</span>
                </div>
              )}
              {hikingRecord.companions && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#b0c8de] w-14 shrink-0">동행인</span>
                  <span className="text-[#1a3a5c]">{hikingRecord.companions}</span>
                </div>
              )}
              {hikingRecord.memo && (
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-xs text-[#b0c8de]">메모</span>
                  <p className="text-sm text-[#1a3a5c] leading-relaxed">{hikingRecord.memo}</p>
                </div>
              )}
              {hikingRecord.photo_urls?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {hikingRecord.photo_urls.map(url => (
                    <img key={url} src={url} alt="" className="w-24 h-24 rounded-xl object-cover" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-2">
              <p className="text-sm text-[#b0c8de]">아직 기록이 없어요</p>
              <p className="text-xs text-[#dce8f5]">날짜, 날씨, 동행인, 사진을 남겨보세요</p>
            </div>
          )}
        </div>

        {/* 포함 기관 정보 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#1a3a5c] mb-3">포함된 100대 명산 리스트</p>
          <div className="flex flex-col gap-2">
            {['산림청', 'BAC', '한국의산하', '월간산'].map(org => {
              const included = mountain.organizations.includes(org)
              return (
                <div key={org} className="flex items-center justify-between py-1">
                  <span className={`text-sm ${included ? 'text-[#1a3a5c] font-medium' : 'text-[#dce8f5]'}`}>
                    {org} 100대 명산
                  </span>
                  {included
                    ? <CheckCircle2 size={18} fill="#34c46a" color="white" />
                    : <Circle size={18} className="text-[#e8f0f8]" />
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>

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
