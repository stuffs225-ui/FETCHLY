export type Who = 'a' | 'b'
export type Gender = 'm' | 'f'
export type PState = 'here' | 'away' | 'gone'

/** Slot A is "her", slot B is "him". Nothing is ever displayed by name. */
export const GENDERS: Record<Who, Gender> = { a: 'f', b: 'm' }

export interface Profile {
  who: Who
  partner: Who
}

export interface Bottle {
  id: number
  kind: 'text' | 'voice'
  text: string | null
  createdAt: number
  openedAt: number | null
  audioUrl: string | null
}

export interface Together {
  total: number
  today: number
}

export interface DistanceInfo {
  meters: number | null
  precise: boolean
  at: { a: number | null; b: number | null }
  closestToday: number | null
}
