import { GENDERS } from './types'
import type { Profile } from './types'

/**
 * All Arabic wording. Nobody is called by name — the other person is simply
 * "هي" or "هو", and every verb agrees with the right gender.
 */
export function makeCopy(p: Profile) {
  const mf = GENDERS[p.who]
  const of = GENDERS[p.partner]
  const you = (m: string, f: string) => (mf === 'm' ? m : f)
  const they = (m: string, f: string) => (of === 'm' ? m : f)
  const other = they('هو', 'هي')
  const his = they('ه', 'ها')

  return {
    other,
    status: {
      together: 'أنتما هنا الآن… معًا',
      togetherSub: 'قلباكما ينبضان بإيقاع واحد',
      alone: `${other} ليس${they('', 'ت')} هنا الآن`,
      aloneSub: (when: string) => (when ? `آخر مرة كان${they('', 'ت')} هنا ${when}` : `لم ${they('يدخل', 'تدخل')} بعد`),
      away: `${other} بعيد${they('', 'ة')} عن الشاشة قليلًا`,
      awaySub: `قلب${his} ما زال معك`,
      connecting: 'نتصل بقلبك…',
    },
    distance: {
      title: (d: string) => `${d} بينكما`,
      lastKnown: (d: string, when: string) => `${d} · آخر موقع ${when}`,
      vclose: 'أنتما قريبان جدًا… التفتا حولكما',
      close: 'قريبان من بعض',
      area: 'في نفس المنطقة تقريبًا',
      far: 'بينكما مسافة… لكن النبض واحد',
      closest: (d: string) => `أقرب ما كنتما اليوم: ${d}`,
      askTitle: 'هل نعرف كم تبعدان عن بعض؟',
      askBody: `نحتاج موقعك مرة واحدة. لا يرى ${other} إلا المسافة، ولا يُحفظ أي سجل لتنقلاتك.`,
      askYes: 'نعم، شارك موقعي',
      askNo: 'ليس الآن',
      denied: 'الموقع مغلق على هذا الجوال. فعّله من إعدادات المتصفح ثم أعد فتح الصفحة',
      unsupported: 'هذا المتصفح لا يدعم تحديد الموقع',
      waitingOther: `بانتظار أن ${they('يشارك', 'تشارك')} ${other} موقع${his}`,
    },
    toast: {
      partnerHere: `${other} ${they('دخل', 'دخلت')}… قلب${his} بدأ ينبض`,
      partnerLeft: `${other} ${they('غادر', 'غادرت')}… وقلب${his} ما زال معك`,
      touched: `${other} ${they('لمس', 'لمست')} قلبك`,
      newBottle: `${other} ${they('رمى', 'رمت')} لك زجاجة جديدة`,
      opened: `${other} ${they('فتح', 'فتحت')} زجاجتك`,
      thrown: `رميتها في البحر… وستجدها ${other} عندما يشاء القدر`,
      thrownVoice: `رميت صوتك في البحر… وسيصل ${other} يومًا ما`,
      micDenied: 'لم نستطع الوصول إلى المايك. اسمح به من إعدادات المتصفح',
      error: 'حدث خطأ، جرّب مرة ثانية',
    },
    touchHint: `المس قلب${his} ليخفق أسرع`,
    sea: {
      calm: 'البحر هادئ الآن',
      calmSub: `لا توجد زجاجات جديدة من ${other}`,
      waiting: (n: string) => `تنتظرك ${n} من ${other}`,
      shakeHint: 'هزّ جوالك… أو المس الزجاجة',
      open: 'افتح زجاجة',
      write: 'اكتب زجاجة',
      empty: `لم ${they('يرمِ', 'ترمِ')} ${other} أي زجاجة بعد`,
      fresh: 'زجاجة جديدة',
      old: 'ذكرى عادت إليك',
      reply: 'ردّ بزجاجة',
      writeTitle: 'ماذا تريد أن تقول؟',
      placeholder: you('اكتب ما في قلبك…', 'اكتبي ما في قلبك…'),
      throwIt: 'ارمِها في البحر',
      mine: 'ما رميته',
      kept: 'ما حفظته',
      notFound: 'لم تُفتح بعد',
      noneMine: 'لم ترمِ أي زجاجة بعد',
      noneKept: 'لم تفتح أي زجاجة بعد',
    },
    join: {
      chooseTitle: you('اختر رمزك', 'اختاري رمزك'),
      chooseSub: you('مرة واحدة فقط. سيُحفظ على هذا الجوال، وتحتاجه لو غيّرت جوالك.', 'مرة واحدة فقط. سيُحفظ على هذا الجوال، وتحتاجينه لو غيّرتِ جوالك.'),
      enterTitle: 'أهلًا بعودتك',
      enterSub: 'اكتب رمزك',
      placeholder: 'الرمز',
      go: 'ادخل',
      short: 'الرمز قصير (٤ أحرف على الأقل)',
      wrong: 'ليس هذا الرمز… جرّب مرة ثانية',
      tooMany: 'محاولات كثيرة، انتظر قليلًا',
    },
  }
}

export type Copy = ReturnType<typeof makeCopy>
