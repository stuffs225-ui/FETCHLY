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

export type Mood = 'miss' | 'thanks' | 'sorry' | 'laugh' | 'calm'

export interface BottleSong {
  platform: Platform
  ytId: string
  url: string
  title: string
  thumb: string | null
  embed: boolean
  start: number
}

export interface Bottle {
  id: number
  author: Who
  kind: 'text' | 'voice'
  text: string | null
  mood: Mood | null
  createdAt: number
  openedAt: number | null
  /** The bottle is still travelling until this moment. */
  arriveAt: number | null
  /** The bottle cannot be opened before this moment. */
  unlockAt: number | null
  /** Minutes since midnight (author's clock) and the distance between them when it was written. */
  stampMin: number | null
  stampDist: number | null
  song: BottleSong | null
  audioUrl: string | null
  photoUrl: string | null
}

/** What the sea scene draws. Contents of unopened bottles are never included. */
export interface SeaSummary {
  inbound: { id: number; mood: Mood | null; author: Who }[]
  waiting: number
  locked: { id: number; mood: Mood | null; unlockAt: number }[]
  sailing: { id: number; mood: Mood | null; arriveAt: number }[]
  lanterns: number
  lastAt: number | null
  kept: Bottle[]
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

export type Platform = 'youtube' | 'instagram' | 'tiktok'

export const PLATFORM_NAME: Record<Platform, string> = { youtube: 'يوتيوب', instagram: 'إنستغرام', tiktok: 'تيك توك' }

/** A shared link (the table kept its old name). `ytId` holds the platform's own id for all three. */
export interface Song {
  id: number
  author: Who
  platform: Platform
  url: string
  thumb: string | null
  /** false → cannot be played inside the page; tapping opens the platform instead. */
  embed: boolean
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
