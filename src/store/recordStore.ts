import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface HikingRecord {
  id: string
  mountain_id: string
  hiked_date: string | null
  companions: string | null
  weather: string | null
  memo: string | null
  photo_urls: string[]
  hike_count: number | null
  created_at: string
}

interface RecordStore {
  records: HikingRecord[]
  loading: boolean
  fetchRecords: () => Promise<void>
  saveRecord: (data: Omit<HikingRecord, 'id' | 'created_at'>) => Promise<HikingRecord | null>
  updateRecord: (id: string, data: Partial<Omit<HikingRecord, 'id' | 'created_at'>>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
}

export const useRecordStore = create<RecordStore>((set, get) => ({
  records: [],
  loading: false,

  fetchRecords: async () => {
    set({ loading: true })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ loading: false }); return }
    const { data } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user.id)
      .order('hiked_date', { ascending: false, nullsFirst: false })
    set({ records: data ?? [], loading: false })
  },

  saveRecord: async (input) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase
      .from('records')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()
    if (error || !data) return null
    set({ records: [data, ...get().records] })
    return data
  },

  updateRecord: async (id, input) => {
    const { data } = await supabase
      .from('records')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      set({ records: get().records.map(r => r.id === id ? data : r) })
    }
  },

  deleteRecord: async (id) => {
    await supabase.from('records').delete().eq('id', id)
    set({ records: get().records.filter(r => r.id !== id) })
  },
}))
