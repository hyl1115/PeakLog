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
        .from('record-photos')
        .upload(path, file, { upsert: true })
      if (!error) {
        const { data: urlData } = supabase.storage.from('record-photos').getPublicUrl(path)
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
    <div className="flex flex-col min-h-screen bg-[#f0f6ff]">
      <div className="relative bg-white px-4 pt-12 pb-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 p-1 text-[#5a7a9a] active:scale-90 transition-transform"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="text-center text-base font-semibold text-[#1a3a5c] pt-1">
          {mountain?.name_ko ?? ''} 기록
        </h1>
        {existingRecord && (
          <button
            onClick={handleDelete}
            className="absolute top-12 right-4 p-1 text-[#e63329] active:scale-90 transition-transform"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 px-4 py-5 pb-10">
        {/* 날짜 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#5a7a9a] mb-2">날짜</p>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full text-sm text-[#1a3a5c] outline-none bg-transparent"
          />
        </div>

        {/* 날씨 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#5a7a9a] mb-3">날씨</p>
          <div className="flex gap-2">
            {WEATHER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setWeather(weather === opt.value ? '' : opt.value)}
                className={`flex-1 h-11 rounded-xl text-xl flex items-center justify-center transition-all
                  ${weather === opt.value
                    ? 'bg-[#e8f0f8] shadow-sm scale-105'
                    : 'bg-[#f8fbff]'}`}
              >
                {opt.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 동행인 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#5a7a9a] mb-2">동행인</p>
          <input
            type="text"
            value={companions}
            onChange={e => setCompanions(e.target.value)}
            placeholder="함께한 사람을 입력하세요"
            className="w-full text-sm text-[#1a3a5c] placeholder-[#d0e0ef] outline-none bg-transparent"
          />
        </div>

        {/* 메모 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#5a7a9a] mb-2">메모</p>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="산행 소감을 자유롭게 적어보세요"
            rows={4}
            className="w-full text-sm text-[#1a3a5c] placeholder-[#d0e0ef] outline-none bg-transparent resize-none"
          />
        </div>

        {/* 사진 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#5a7a9a] mb-3">
            사진 <span className="text-[#b0c8de] font-normal">({photos.length}/3)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {photos.map(url => (
              <div key={url} className="relative w-24 h-24">
                <img src={url} alt="" className="w-24 h-24 rounded-xl object-cover" />
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#e63329] rounded-full flex items-center justify-center"
                >
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-[#dce8f5]
                flex flex-col items-center justify-center gap-1 cursor-pointer
                ${uploading ? 'opacity-50' : 'active:scale-95 transition-transform'}`}>
                <Camera size={20} className="text-[#b0c8de]" />
                <span className="text-[10px] text-[#b0c8de]">{uploading ? '업로드 중' : '추가'}</span>
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
          className="w-full py-4 bg-[#e63329] text-white text-base rounded-2xl shadow-md active:scale-95 transition-transform disabled:opacity-60"
          style={{ fontFamily: 'Jua, sans-serif' }}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}
