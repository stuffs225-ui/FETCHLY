import type { Mood } from './types'

/** Soft, calm tints for the five moods. Labels live in the copy file. */
export const MOODS: { key: Mood; color: string }[] = [
  { key: 'miss', color: '#e08aa0' },
  { key: 'thanks', color: '#e0b86a' },
  { key: 'sorry', color: '#8fa6c8' },
  { key: 'laugh', color: '#7fc4b0' },
  { key: 'calm', color: '#a99bd4' },
]

export const moodColor = (m: Mood | null | undefined) => MOODS.find((x) => x.key === m)?.color ?? null
