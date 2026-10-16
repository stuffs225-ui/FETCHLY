import { GENDERS } from './types'
import type { Profile } from './types'

/**
 * Arabic wording, kept short. Nobody is named and no pronoun is used as a
 * subject — verbs simply agree with the other person's gender.
 */
export function makeCopy(p: Profile) {
  const mf = GENDERS[p.who]
  const of = GENDERS[p.partner]
  const you = (m: string, f: string) => (mf === 'm' ? m : f)
  const they = (m: string, f: string) => (of === 'm' ? m : f)

  return {
    status: {
      together: 'أنتما هنا الآن… معًا',
      togetherSub: '',
      alone: `ليس${they('', 'ت')} هنا الآن`,
      aloneSub: (when: string) => (when ? `آخر مرة ${when}` : `لم ${they('يدخل', 'تدخل')} بعد`),
      away: `بعيد${they('', 'ة')} عن الشاشة قليلًا`,
      awaySub: '',
      connecting: '…',
    },
    distance: {
      title: (d: string) => `${d} بينكما`,
      lastKnown: (d: string, when: string) => `${d} · آخر موقع ${when}`,
      vclose: 'أنتما قريبان جدًا… التفتا حولكما',
      close: 'قريبان من بعض',
      area: 'في نفس المنطقة تقريبًا',
      far: 'بينكما مسافة… لكن النبض واحد',
      closest: (d: string) => `أقرب ما كنتما اليوم: ${d}`,
      askTitle: 'مشاركة الموقع لمعرفة المسافة',
      askBody: '',
      askYes: 'مشاركة',
      askNo: 'لاحقًا',
      denied: 'الموقع مغلق من إعدادات المتصفح',
      unsupported: '',
      waitingOther: `بانتظار ${they('أن يشارك', 'أن تشارك')} موقع${they('ه', 'ها')}`,
    },
    toast: {
      partnerHere: `${they('دخل', 'دخلت')}… ${they('قلبه', 'قلبها')} ينبض`,
      partnerLeft: `${they('غادر', 'غادرت')}`,
      touched: `${they('لمس', 'لمست')} قلبك`,
      newBottle: `${they('رمى', 'رمت')} لك زجاجة`,
      opened: `${they('فتح', 'فتحت')} زجاجتك`,
      thrown: 'رميتها في البحر',
      thrownVoice: 'رميت صوتك في البحر',
      micDenied: 'المايك مغلق من إعدادات المتصفح',
      error: 'حدث خطأ، جرّب مرة ثانية',
      newSong: `${they('أضاف', 'أضافت')} أغنية`,
      invite: `${they('يدعوك', 'تدعوك')} للاستماع معًا`,
      listenEnded: 'انتهى الاستماع المشترك',
      ytBlocked: 'تعذّر تشغيل هذا الفيديو هنا',
    },
    songs: {
      title: 'الأغاني',
      add: 'إضافة',
      pastePlaceholder: 'الصق رابط يوتيوب',
      paste: 'لصق',
      note: 'سطر عنها (اختياري)',
      startsAt: 'يبدأ من',
      send: 'أضف',
      empty: 'لا أغاني بعد',
      pickOne: 'اختر أغنية',
      together: 'استمعا معًا',
      stop: 'إنهاء',
      waiting: 'بانتظار الانضمام…',
      cancel: 'إلغاء',
      join: 'انضمّ',
      later: 'لاحقًا',
      playingTogether: 'تستمعان معًا',
      tapToPlay: 'اضغط للتشغيل',
      openYt: 'فتح في يوتيوب',
      next: 'التالية',
      errors: {
        bad_link: 'هذا ليس رابط يوتيوب',
        not_found: 'لم نجد هذا الفيديو',
        not_embeddable: 'هذا الفيديو لا يسمح بتشغيله خارج يوتيوب',
        generic: 'تعذّر قراءة الرابط',
      },
    },
    touchHint: '',
    sea: {
      calm: 'البحر هادئ الآن',
      calmSub: '',
      waiting: (n: string) => `تنتظرك ${n}`,
      shakeHint: '',
      open: 'افتح زجاجة',
      write: 'اكتب زجاجة',
      empty: 'لا توجد زجاجات بعد',
      fresh: 'جديدة',
      old: 'قديمة',
      reply: 'ردّ',
      writeTitle: 'زجاجة',
      placeholder: you('اكتب…', 'اكتبي…'),
      throwIt: 'ارمِها',
      mine: 'ما رميته',
      kept: 'ما حفظته',
      notFound: 'لم تُفتح بعد',
      noneMine: 'لا شيء بعد',
      noneKept: 'لا شيء بعد',
    },
    join: {
      chooseHint: you('اختر رمزًا', 'اختاري رمزًا'),
      placeholder: 'الرمز',
      go: 'ادخل',
      invite: 'رمز الدعوة',
      badInvite: 'رمز الدعوة غير صحيح',
      short: '٤ أحرف على الأقل',
      wrong: 'ليس هذا الرمز',
      tooMany: 'محاولات كثيرة، انتظر قليلًا',
    },
  }
}

export type Copy = ReturnType<typeof makeCopy>
