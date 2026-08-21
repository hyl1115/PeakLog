export interface Mountain {
  id: string
  name_ko: string
  height: number
  region: string
  organizations: string[]
  lat: number | null
  lng: number | null
}

export type OrgFilter = '전체' | '산림청' | 'BAC' | '한국의산하' | '월간산'

export const ORG_LIST: OrgFilter[] = ['전체', '산림청', 'BAC', '한국의산하', '월간산']

export const ORG_COLORS: Record<string, string> = {
  '산림청':   'bg-success-soft text-brand',
  'BAC':      'bg-sunken text-ink-2',
  '한국의산하': 'bg-accent-soft text-ink-2',
  '월간산':   'bg-[oklch(96%_0.020_300)] text-[oklch(52%_0.060_300)]',
}
