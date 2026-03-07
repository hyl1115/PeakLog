import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Mountain } from '../types'

export interface CompletionRecord {
  mountain_id: string
  completed_at: string
  hiked_date: string | null
}

interface MountainStore {
  mountains: Mountain[]
  completedIds: Set<string>
  completionRecords: CompletionRecord[]
  loading: boolean
  fetchMountains: () => Promise<void>
  fetchCompletions: () => Promise<void>
  toggleCompletion: (mountainId: string, hikedDate?: string | null) => Promise<void>
}

export const useMountainStore = create<MountainStore>((set, get) => ({
  mountains: [],
  completedIds: new Set(),
  completionRecords: [],
  loading: false,

  fetchMountains: async () => {
    set({ loading: true })
    const { data } = await supabase.from('mountains').select('*').order('name_ko')
    set({ mountains: data ?? [], loading: false })
  },

  fetchCompletions: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('completions')
      .select('mountain_id, completed_at, hiked_date')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
    const records: CompletionRecord[] = data ?? []
    const ids = new Set(records.map(r => r.mountain_id))
    set({ completedIds: ids, completionRecords: records })
  },

  toggleCompletion: async (mountainId: string, hikedDate?: string | null) => {
    const { completedIds, completionRecords } = get()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (completedIds.has(mountainId)) {
      const next = new Set(completedIds)
      next.delete(mountainId)
      set({
        completedIds: next,
        completionRecords: completionRecords.filter(r => r.mountain_id !== mountainId),
      })
      await supabase.from('completions').delete()
        .eq('user_id', user.id)
        .eq('mountain_id', mountainId)
    } else {
      const newRecord: CompletionRecord = {
        mountain_id: mountainId,
        completed_at: new Date().toISOString(),
        hiked_date: hikedDate ?? null,
      }
      const next = new Set(completedIds)
      next.add(mountainId)
      set({
        completedIds: next,
        completionRecords: [newRecord, ...completionRecords],
      })
      await supabase.from('completions').insert({
        user_id: user.id,
        mountain_id: mountainId,
        hiked_date: hikedDate ?? null,
      })
    }
  },
}))
