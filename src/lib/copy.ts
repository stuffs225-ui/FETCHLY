import type { Gender, Profile } from './types'

/** All Arabic wording, gendered per person so every line speaks to the right "you" and about the right "her/him". */
export function makeCopy(p: Profile) {
  const me = p.who
  const other = p.partner
  const g = (m: string, f: string, who: 'me' | 'other') => ((who === 'me' ? p.genders[me] : p.genders[other]) === 'm' ? m : f)
  const you = (m: string, f: string) => g(m, f, 'me')
  const they = (m: string, f: string) => g(m, f, 'other')
  const name = p.names[other]
  const myName = p.names[me]
  const pronoun = (gender: Gender) => (gender === 'm' ? 'ه' : 'ها')
  const his = pronoun(p.genders[other])

  return {
    name,
    myName,
    pronoun: his,
    status: {
      together: 'أنتما هنا الآن… معًا',
      togetherSub: `قلباكما ينبضان بإيقاع واحد`,
      alone: `${name} ليس${they('', 'ت')} هنا الآن`,
      aloneSub: (when: string) => (when ? `آخر مرة كان${they('', 'ت')} هنا ${when}` : `لم ${they('يدخل', 'تدخل')} بعد`),
      away: `${name} ${they('هنا', 'هنا')} لكن بعيد${they('', 'ة')} قليلًا`,
      awaySub: `قلب${his} ما زال معك`,
      connecting: 'نتصل بقلبك…',
      waiting: `قلبك ينبض بانتظار ${name}`,
    },
    toast: {
      partnerHere: `${name} ${they('دخل', 'دخلت')}… قلب${his} بدأ ينبض`,
      partnerLeft: `${name} ${they('غادر', 'غادرت')}… وقلب${his} ما زال معك`,
      touched: `${name} ${they('لمس', 'لمست')} قلبك`,
      newBottle: `${they('رمى', 'رمت')} ${name} لك زجاجة جديدة`,
      opened: `${name} ${they('فتح', 'فتحت')} زجاجتك`,
      thrown: `رميتها في البحر… وستجدها ${name} عندما يشاء القدر`,
      thrownVoice: `رميت صوتك في البحر… وسيصل ${name} يومًا ما`,
      micDenied: 'لم نستطع الوصول إلى المايك. اسمح به من إعدادات المتصفح',
      saved: 'تم الحفظ',
      error: 'حدث خطأ، جرّب مرة ثانية',
    },
    touchHint: `المس قلب${his} ليخفق أسرع`,
    sea: {
      calm: 'البحر هادئ الآن',
      calmSub: `لا توجد زجاجات جديدة من ${name}`,
      waiting: (n: string) => `تنتظرك ${n} من ${name}`,
      shakeHint: 'هزّ جوالك… أو المس الزجاجة',
      open: 'افتح زجاجة',
      write: 'اكتب زجاجة',
      empty: `لم ${they('يرمِ', 'ترمِ')} ${name} أي زجاجة بعد`,
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
    enter: {
      title: 'نبضنا',
      sub: 'مكان صغير لا يدخله أحد غيرنا',
      phrase: 'الكلمة السرّية بيننا',
      go: 'ادخل',
      wrong: 'ليست هذه الكلمة… جرّب مرة ثانية',
      tooMany: 'محاولات كثيرة، انتظر قليلًا ثم جرّب',
    },
  }
}

export type Copy = ReturnType<typeof makeCopy>
