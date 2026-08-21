import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2, Camera, X } from 'lucide-react'
import { useMountainStore } from '../store/mountainStore'
import { useRecordStore } from '../store/recordStore'
import { supabase } from '../lib/supabase'

const WEATHER_OPTIONS = [
  { value: '☀️ 맑음', emoji: '☀️' },
  { value: '⛅ 구름', emoji: '⛅' },
  { value: '🌧️ 비', emoji: '🌧️' },
  { value: '❄️ 눈', emoji: '❄️' },
  { value: '🌫️ 안개', emoji: '🌫️' },
]

export default function RecordEditPage() {
  const { mountainId } = useParams<{ mountainId: string }>()
  const navigate = useNavigate()
  const { mountains, fetchMountains } = useMountainStore()
  const { records, fetchRecords, saveRecord, updateRecord, deleteRecord } = useRecordStore()

  const [date, setDate] = useState('')
  const [companions, setCompanions] = useState('')
  const [weather, setWeather] = useState('')
  const [memo, setMemo] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [hikeCount, setHikeCount] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (mountains.length === 0) fetchMountains()
    fetchRecords()
  }, [])

  const mountain = mountains.find(m => m.id === mountainId)
  const existingRecord = records.find(r => r.mountain_id === mountainId)

  useEffect(() => {
    if (existingRecord && !initialized) {
      setDate(existingRecord.hiked_date ?? '')
      setCompanions(existingRecord.companions ?? '')
      setWeather(existingRecord.weather ?? '')
      setMemo(existingRecord.memo ?? '')
      setPhotos(existingRecord.photo_urls ?? [])
      setHikeCount(existingRecord.hike_count ?? 1)
      setInitialized(true)
    }
  }, [existingRecord, initialized])

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (photos.length + files.length > 3) {
      alert('사진은 최대 3장까지 추가할 수 있어요')
      return
    }
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const uploaded: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${mountainId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('record-photo')
        .upload(path, file, { upsert: true })
      if (error) {
        console.error('사진 업로드 실패:', error.message)
        alert(`사진 업로드에 실패했어요: ${error.message}`)
      } else {
        const { data: urlData } = supabase.storage.from('record-photo').getPublicUrl(path)
        uploaded.push(urlData.publicUrl)
      }
    }
    setPhotos(prev => [...prev, ...uploaded])
    setUploading(false)
  }

  const removePhoto = (url: string) => {
    setPhotos(prev => prev.filter(p => p !== url))
  }

  const handleSave = async () => {
    setSaving(true)
    const data = {
      mountain_id: mountainId!,
      hiked_date: date || null,
      companions: companions.trim() || null,
      weather: weather || null,
      memo: memo.trim() || null,
      photo_urls: photos,
      hike_count: hikeCount,
    }
    if (existingRecord) {
      await updateRecord(existingRecord.id, data)
    } else {
      await saveRecord(data)
    }
    setSaving(false)
    navigate(-1)
  }

  const handleDelete = async () => {
    if (!existingRecord) return
    if (!confirm('기록을 삭제할까요?')) return
    await deleteRecord(existingRecord.id)
    navigate(-1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      {/* 헤더 */}
      <div className="relative bg-surface px-4 pt-12 pb-4 shadow-card">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 p-1 text-ink-2 transition-opacity active:opacity-60"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="text-center text-base font-semibold text-ink pt-1">
          {mountain?.name_ko ?? ''} 기록
        </h1>
        {existingRecord && (
          <button
            onClick={handleDelete}
            className="absolute top-12 right-4 p-1 text-muted transition-opacity active:opacity-60"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 py-5 pb-10">
        {/* 날짜 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-2 mb-2">날짜</p>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full text-sm text-ink outline-none bg-transparent"
          />
        </div>

        {/* 등반 횟수 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-2 mb-3">등반 횟수</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHikeCount(c => Math.max(1, c - 1))}
              className="w-9 h-9 rounded-full bg-paper text-ink text-lg font-bold flex items-center justify-center transition-opacity active:opacity-60"
            >
              −
            </button>
            <span className="flex-1 text-center text-base font-semibold text-ink">{hikeCount}회</span>
            <button
              onClick={() => setHikeCount(c => c + 1)}
              className="w-9 h-9 rounded-full bg-paper text-ink text-lg font-bold flex items-center justify-center transition-opacity active:opacity-60"
            >
              +
            </button>
          </div>
        </div>

        {/* 날씨 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-2 mb-3">날씨</p>
          <div className="flex gap-2">
            {WEATHER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setWeather(weather === opt.value ? '' : opt.value)}
                className={`flex-1 h-11 rounded-field text-xl flex items-center justify-center transition-all
                  ${weather === opt.value
                    ? 'bg-sunken shadow-card ring-1 ring-brand/30'
                    : 'bg-surface'}`}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 동행인 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-2 mb-2">동행인</p>
          <input
            type="text"
            value={companions}
            onChange={e => setCompanions(e.target.value)}
            placeholder="함께한 사람을 입력하세요"
            className="w-full text-sm text-ink placeholder-faint outline-none bg-transparent"
          />
        </div>

        {/* 메모 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-2 mb-2">메모</p>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="산행 소감을 자유롭게 적어보세요"
            rows={4}
            className="w-full text-sm text-ink placeholder-faint outline-none bg-transparent resize-none"
          />
        </div>

        {/* 사진 */}
        <div className="bg-surface rounded-card p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-2 mb-3">
            사진 <span className="text-faint font-normal">({photos.length}/3)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {photos.map(url => (
              <div key={url} className="relative w-24 h-24">
                <img src={url} alt="" className="w-24 h-24 rounded-field object-cover" />
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink rounded-full flex items-center justify-center"
                >
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className={`w-24 h-24 rounded-field border-2 border-dashed border-rule
                flex flex-col items-center justify-center gap-1 cursor-pointer
                ${uploading ? 'opacity-50' : 'transition-opacity active:opacity-70'}`}>
                <Camera size={20} className="text-faint" />
                <span className="text-[10px] text-faint">{uploading ? '업로드 중' : '추가'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={handlePhotoSelect}
                />
              </label>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-accent text-ink text-base font-semibold rounded-card shadow-card active:scale-[0.97] transition-transform disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
