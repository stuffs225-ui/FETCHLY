export type Who = 'a' | 'b'
export type Gender = 'm' | 'f'
export type PState = 'here' | 'away' | 'gone'

/** Slot A is "her", slot B is "him". Nothing is ever displayed by name. */
export const GENDERS: Record<Who, Gender> = { a: 'f', b: 'm' }

export interface Profile {
  who: Who
  partner: Who
  /** Present only until the other person has joined: the code they need for their first entry. */
  invite?: string
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

export interface Song {
  id: number
  author: Who
  ytId: string
  title: string
  channel: string | null
  note: string | null
  start: number
  reaction: 'heart' | null
  createdAt: number
}

/** Shared "listening together" session. `startAt` (server clock, ms) is when both phones begin. */
export interface Listen {
  status: 'invite' | 'playing'
  host: Who
  songId: number
  ytId: string
  title: string
  startSec: number
  createdAt: number
  startAt?: number
}

export interface SongsInfo {
  n: number
  lastId: number
  lastAuthor: Who | null
}
