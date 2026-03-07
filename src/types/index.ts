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
  '산림청':   'bg-green-100 text-green-700',
  'BAC':      'bg-blue-100 text-blue-700',
  '한국의산하': 'bg-orange-100 text-orange-700',
  '월간산':   'bg-purple-100 text-purple-700',
}
