import { GENDERS } from './types'
import type { Who } from './types'

export const linkFor = (key: string) => `${location.origin}/?k=${key}`

/** The message that gets sent along with the private link, worded for the receiver. */
export function inviteText(receiver: Who, key: string) {
  const f = GENDERS[receiver] === 'f'
  return `هذا مكاننا الخاص 💗\n${f ? 'افتحيه' : 'افتحه'} من هذا الرابط، و${f ? 'اختاري' : 'اختر'} كلمة سرّ مرة واحدة فقط، وبعدها يبقى محفوظًا على جوالك:\n${linkFor(key)}`
}

export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}
