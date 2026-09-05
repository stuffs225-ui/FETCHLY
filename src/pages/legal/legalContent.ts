export interface LegalSection {
  heading: string
  body: string
}

export interface LegalDoc {
  titleAr: string
  titleEn: string
  sectionsAr: LegalSection[]
  sectionsEn: LegalSection[]
}

export const legalDocs: Record<'privacy' | 'terms' | 'cookies' | 'complaints' | 'disclaimer', LegalDoc> = {
  privacy: {
    titleAr: 'سياسة الخصوصية',
    titleEn: 'Privacy Policy',
    sectionsAr: [
      {
        heading: 'البيانات التي نجمعها',
        body: 'عند إرسال طلب عرض سعر، قد نجمع اسمك، اسم شركتك، بريدك الإلكتروني، رقم جوالك، مدينتك، وتفاصيل المنتج المطلوب (بما في ذلك أي صور أو روابط أو ملفات ترفقها). لا نطلب أي بيانات دفع أو بيانات بطاقات مصرفية عبر الموقع.',
      },
      {
        heading: 'كيف نستخدم بياناتك',
        body: 'نستخدم البيانات المرسلة حصرًا لمراجعة طلبك، البحث عن المصدر المناسب، إعداد عرض السعر، والتواصل معك بخصوص طلبك عبر البريد الإلكتروني أو الهاتف أو واتساب.',
      },
      {
        heading: 'مشاركة البيانات',
        body: 'لا نبيع أو نؤجر بياناتك لأي طرف ثالث. قد نشارك بيانات محدودة مع موردين محتملين فقط بالقدر اللازم للحصول على تسعير أو تأكيد توفر المنتج، دون الكشف عن بياناتك الشخصية الكاملة ما أمكن ذلك.',
      },
      {
        heading: 'الاحتفاظ بالبيانات والملفات',
        body: 'يتم الاحتفاظ بطلبك والمرفقات المرسلة طوال المدة اللازمة لإتمام المعاملة التجارية ولأغراض السجلات الداخلية، ويمكنك طلب حذف بياناتك في أي وقت بالتواصل معنا.',
      },
      {
        heading: 'حقوقك',
        body: 'يحق لك طلب الاطلاع على بياناتك المحفوظة لدينا، تصحيحها، أو طلب حذفها، وذلك بالتواصل معنا على {{email}}.',
      },
      {
        heading: 'التواصل بخصوص الخصوصية',
        body: 'لأي استفسار يخص هذه السياسة أو معالجة بياناتك، يرجى التواصل معنا على {{email}}.',
      },
    ],
    sectionsEn: [
      {
        heading: 'Information We Collect',
        body: 'When you submit a quote request, we may collect your name, company name, email address, phone number, city, and details of the requested product (including any images, links, or files you attach). We do not collect any payment or banking card data through the website.',
      },
      {
        heading: 'How We Use Your Data',
        body: 'We use the information you submit solely to review your request, identify a suitable source, prepare a quotation, and communicate with you about your request by email, phone, or WhatsApp.',
      },
      {
        heading: 'Sharing Your Data',
        body: 'We do not sell or rent your data to any third party. We may share limited data with potential suppliers only to the extent necessary to obtain pricing or confirm product availability, avoiding disclosure of your full personal details where possible.',
      },
      {
        heading: 'Data & File Retention',
        body: 'Your request and any attached files are retained for as long as necessary to complete the commercial transaction and for internal record-keeping purposes. You may request deletion of your data at any time by contacting us.',
      },
      {
        heading: 'Your Rights',
        body: 'You have the right to request access to, correction of, or deletion of the data we hold about you by contacting us at {{email}}.',
      },
      {
        heading: 'Contact About Privacy',
        body: 'For any question regarding this policy or the processing of your data, please contact us at {{email}}.',
      },
    ],
  },
  terms: {
    titleAr: 'الشروط والأحكام',
    titleEn: 'Terms & Conditions',
    sectionsAr: [
      {
        heading: 'طبيعة الخدمة',
        body: 'يُقدَّم هذا الموقع خدمة توريد عالمي: يرسل العميل احتياجه من منتج، ونقوم بالبحث عنه عالميًا وإعداد عرض سعر يُرسل عبر البريد الإلكتروني. لا يُعد استخدام النموذج أو استلام عرض السعر التزامًا بالشراء من أي طرف.',
      },
      {
        heading: 'لا بيع مباشر عبر الموقع',
        body: 'هذا الموقع ليس متجرًا إلكترونيًا، ولا يتم إتمام أي عملية شراء أو دفع عبره. تتم كافة الإجراءات التجارية، بما في ذلك تأكيد الطلب والدفع، بشكل منفصل عبر البريد الإلكتروني أو القنوات المتفق عليها.',
      },
      {
        heading: 'دقة المعلومات المقدمة',
        body: 'يلتزم العميل بتقديم معلومات صحيحة قدر الإمكان عن المنتج المطلوب. قد يؤدي نقص المعلومات إلى تأخير إعداد عرض السعر أو الحاجة للتواصل للاستيضاح.',
      },
      {
        heading: 'صلاحية عروض الأسعار',
        body: 'تخضع كل عروض الأسعار لمدة صلاحية محددة موضحة داخل العرض نفسه، وقد تتغير الأسعار بعد انتهاء هذه المدة تبعًا لتغير أسعار السوق أو الشحن أو الصرف.',
      },
      {
        heading: 'الالتزام بالأنظمة',
        body: 'يخضع توريد أي منتج لالتزام الطرفين بالأنظمة السعودية ذات العلاقة، بما في ذلك متطلبات الاستيراد والجمارك والمطابقة حيثما تنطبق.',
      },
      {
        heading: 'التعديلات',
        body: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيُشار إلى تاريخ آخر تحديث أدناه.',
      },
    ],
    sectionsEn: [
      {
        heading: 'Nature of the Service',
        body: 'This website provides a global sourcing service: the customer submits a product requirement, and we search for it globally and prepare a quotation sent by email. Using the form or receiving a quotation does not constitute a purchase commitment by either party.',
      },
      {
        heading: 'No Direct Sale Through the Website',
        body: 'This website is not an e-commerce store, and no purchase or payment is completed through it. All commercial steps, including order confirmation and payment, take place separately by email or agreed channels.',
      },
      {
        heading: 'Accuracy of Submitted Information',
        body: 'The customer undertakes to provide information about the requested product that is as accurate as possible. Incomplete information may delay preparation of the quotation or require follow-up for clarification.',
      },
      {
        heading: 'Quotation Validity',
        body: 'All quotations are subject to a stated validity period shown on the quotation itself, and prices may change after that period due to market, freight, or exchange-rate fluctuations.',
      },
      {
        heading: 'Regulatory Compliance',
        body: 'Sourcing of any product is subject to both parties\' compliance with relevant Saudi regulations, including import, customs, and conformity requirements where applicable.',
      },
      {
        heading: 'Changes',
        body: 'We reserve the right to amend these terms at any time; the last-updated date is indicated below.',
      },
    ],
  },
  cookies: {
    titleAr: 'سياسة ملفات الارتباط',
    titleEn: 'Cookie Policy',
    sectionsAr: [
      {
        heading: 'استخدامنا لملفات الارتباط',
        body: 'يستخدم هذا الموقع ملفات ارتباط (Cookies) محدودة لأغراض تشغيلية أساسية فقط، مثل تذكر لغة التصفح المفضلة لديك (العربية أو الإنجليزية).',
      },
      {
        heading: 'لا إعلانات تتبعية',
        body: 'لا يستخدم الموقع ملفات ارتباط لأغراض إعلانية أو تتبع سلوك التصفح عبر مواقع أخرى.',
      },
      {
        heading: 'التحكم بملفات الارتباط',
        body: 'يمكنك التحكم بملفات الارتباط أو حذفها من خلال إعدادات المتصفح الذي تستخدمه في أي وقت.',
      },
    ],
    sectionsEn: [
      {
        heading: 'Our Use of Cookies',
        body: 'This website uses a limited set of cookies for essential operational purposes only, such as remembering your preferred browsing language (Arabic or English).',
      },
      {
        heading: 'No Tracking Advertising',
        body: 'The website does not use cookies for advertising purposes or to track browsing behavior across other websites.',
      },
      {
        heading: 'Managing Cookies',
        body: 'You can control or delete cookies at any time through your browser settings.',
      },
    ],
  },
  complaints: {
    titleAr: 'سياسة الشكاوى',
    titleEn: 'Complaints Policy',
    sectionsAr: [
      {
        heading: 'كيفية تقديم شكوى',
        body: 'إذا واجهت أي مشكلة تخص طلبك أو عرض السعر أو التعامل مع فريقنا، يرجى التواصل معنا مباشرة على {{email}} مع ذكر رقم الطلب إن وجد.',
      },
      {
        heading: 'مدة المعالجة',
        body: 'نلتزم بمراجعة الشكوى والرد عليها خلال مدة معقولة من استلامها، وإبلاغك بالإجراء المتخذ.',
      },
      {
        heading: 'التصعيد',
        body: 'في حال عدم الوصول إلى حل مُرضٍ، يمكن للعميل اتباع القنوات النظامية المتاحة لحل النزاعات التجارية في المملكة العربية السعودية.',
      },
    ],
    sectionsEn: [
      {
        heading: 'How to Submit a Complaint',
        body: 'If you experience any issue related to your request, quotation, or dealings with our team, please contact us directly at {{email}}, quoting your request number if available.',
      },
      {
        heading: 'Resolution Time',
        body: 'We are committed to reviewing and responding to complaints within a reasonable time of receipt, and informing you of the action taken.',
      },
      {
        heading: 'Escalation',
        body: 'If a satisfactory resolution is not reached, the customer may pursue the applicable regulatory channels available for resolving commercial disputes in Saudi Arabia.',
      },
    ],
  },
  disclaimer: {
    titleAr: 'إخلاء المسؤولية',
    titleEn: 'Disclaimer',
    sectionsAr: [
      {
        heading: 'طبيعة عروض الأسعار',
        body: 'تُعد عروض الأسعار المُرسلة تقديرات قائمة على المعلومات المتوفرة وقت التسعير، وقد تتغير تبعًا لتوفر المنتج لدى المصدر أو تغير تكاليف الشحن أو الصرف أو الجمارك.',
      },
      {
        heading: 'المنتجات والمصادر الخارجية',
        body: 'نبذل عناية معقولة في التحقق من المصدر والمنتج قدر الإمكان، إلا أننا لا نضمن بشكل مطلق مطابقة كل منتج لمواصفات محددة لم تُذكر صراحة من العميل.',
      },
      {
        heading: 'المتطلبات النظامية',
        body: 'يبقى العميل مسؤولًا عن التأكد من استيفاء أي متطلبات نظامية أو تصاريح خاصة باستخدامه النهائي للمنتج، ما لم يُتفق صراحة على خلاف ذلك ضمن عرض السعر.',
      },
    ],
    sectionsEn: [
      {
        heading: 'Nature of Quotations',
        body: 'Quotations sent are estimates based on information available at the time of pricing, and may change depending on product availability at the source or fluctuations in freight, exchange rates, or customs costs.',
      },
      {
        heading: 'Products & External Sources',
        body: 'We take reasonable care to verify the source and product where possible; however, we do not absolutely guarantee that every product matches specifications not explicitly stated by the customer.',
      },
      {
        heading: 'Regulatory Requirements',
        body: 'The customer remains responsible for ensuring any regulatory requirements or permits related to their end use of the product are met, unless explicitly agreed otherwise within the quotation.',
      },
    ],
  },
}
