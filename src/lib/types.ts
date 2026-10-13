export type Who = 'a' | 'b'
export type Gender = 'm' | 'f'
export type PState = 'here' | 'away' | 'gone'

export interface Profile {
  who: Who
  partner: Who
  names: Record<Who, string>
  genders: Record<Who, Gender>
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
