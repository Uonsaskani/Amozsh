/* ======================================================================
   داده‌های درس‌های «شروع یادگیری» — برای کسی که هیچ آشنایی‌ای با خواندن قرآن ندارد
   هر درس: توضیح ساده و کوتاه + چند سؤال تمرینی برای تثبیت یادگیری
   ====================================================================== */

const LESSONS = [
  {
    id: 1,
    title: "آشنایی با حروف الفبا (بخش اول)",
    icon: "ا",
    content: `
      <p>قرآن با حروف عربی نوشته شده. اول با ۷ حرف اول آشنا می‌شویم. فقط نگاه کنید و شکل هر حرف را به خاطر بسپارید؛ عجله نکنید.</p>
      <div class="letter-grid">
        <div class="letter-card"><span class="lg">ا</span><span class="ln">اَلِف</span></div>
        <div class="letter-card"><span class="lg">ب</span><span class="ln">باء</span></div>
        <div class="letter-card"><span class="lg">ت</span><span class="ln">تاء</span></div>
        <div class="letter-card"><span class="lg">ث</span><span class="ln">ثاء</span></div>
        <div class="letter-card"><span class="lg">ج</span><span class="ln">جیم</span></div>
        <div class="letter-card"><span class="lg">ح</span><span class="ln">حاء</span></div>
        <div class="letter-card"><span class="lg">خ</span><span class="ln">خاء</span></div>
      </div>
      <p style="margin-top:14px;">نکته‌ی مهم: «ث»، «ح» و «خ» صداهایی دارند که در فارسی نیستند؛ فعلاً فقط شکل‌شان را تشخیص بدهید، تلفظ دقیق را در آینده تمرین می‌کنیم.</p>
    `,
    quiz: [
      { q: "کدام حرف «اَلِف» نام دارد؟", options: ["ا", "ب", "ح"], correct: 0 },
      { q: "کدام یک از این سه حرف «جیم» است؟", options: ["ث", "ج", "خ"], correct: 1 }
    ]
  },
  {
    id: 2,
    title: "آشنایی با حروف الفبا (بخش دوم)",
    icon: "د",
    content: `
      <p>ادامه‌ی حروف الفبا را ببینید:</p>
      <div class="letter-grid">
        <div class="letter-card"><span class="lg">د</span><span class="ln">دال</span></div>
        <div class="letter-card"><span class="lg">ذ</span><span class="ln">ذال</span></div>
        <div class="letter-card"><span class="lg">ر</span><span class="ln">راء</span></div>
        <div class="letter-card"><span class="lg">ز</span><span class="ln">زاء</span></div>
        <div class="letter-card"><span class="lg">س</span><span class="ln">سین</span></div>
        <div class="letter-card"><span class="lg">ش</span><span class="ln">شین</span></div>
        <div class="letter-card"><span class="lg">ص</span><span class="ln">صاد</span></div>
        <div class="letter-card"><span class="lg">ض</span><span class="ln">ضاد</span></div>
      </div>
      <p style="margin-top:14px;">«س» و «ص» شبیه‌اند اما صدای «ص» از عمق دهان و کمی کلفت‌تر است. همین‌طور «د» و «ض».</p>
    `,
    quiz: [
      { q: "کدام حرف «سین» است؟", options: ["ش", "س", "ص"], correct: 1 },
      { q: "نام حرف «ذ» چیست؟", options: ["دال", "ذال", "زاء"], correct: 1 }
    ]
  },
  {
    id: 3,
    title: "آشنایی با حروف الفبا (بخش سوم)",
    icon: "ط",
    content: `
      <p>باقی‌مانده‌ی حروف الفبا:</p>
      <div class="letter-grid">
        <div class="letter-card"><span class="lg">ط</span><span class="ln">طاء</span></div>
        <div class="letter-card"><span class="lg">ظ</span><span class="ln">ظاء</span></div>
        <div class="letter-card"><span class="lg">ع</span><span class="ln">عین</span></div>
        <div class="letter-card"><span class="lg">غ</span><span class="ln">غین</span></div>
        <div class="letter-card"><span class="lg">ف</span><span class="ln">فاء</span></div>
        <div class="letter-card"><span class="lg">ق</span><span class="ln">قاف</span></div>
        <div class="letter-card"><span class="lg">ک</span><span class="ln">کاف</span></div>
        <div class="letter-card"><span class="lg">ل</span><span class="ln">لام</span></div>
        <div class="letter-card"><span class="lg">م</span><span class="ln">میم</span></div>
        <div class="letter-card"><span class="lg">ن</span><span class="ln">نون</span></div>
        <div class="letter-card"><span class="lg">و</span><span class="ln">واو</span></div>
        <div class="letter-card"><span class="lg">ه</span><span class="ln">هاء</span></div>
        <div class="letter-card"><span class="lg">ی</span><span class="ln">یاء</span></div>
      </div>
      <p style="margin-top:14px;">تبریک! حالا تمام ۲۸ حرف الفبای عربی را دیده‌اید. لازم نیست همه را حفظ کرده باشید؛ در درس‌های بعد بارها تکرار می‌شوند.</p>
    `,
    quiz: [
      { q: "کدام حرف «عین» است؟", options: ["غ", "ع", "ق"], correct: 1 },
      { q: "نام حرف «و» چیست؟", options: ["واو", "یاء", "نون"], correct: 0 }
    ]
  },
  {
    id: 4,
    title: "حرکت‌های کوتاه: فتحه، کسره، ضمه",
    icon: "َ",
    content: `
      <p>هر حرف به‌تنهایی صدا ندارد؛ با یک «حرکت» بالای یا زیرش صدادار می‌شود. سه حرکت اصلی:</p>
      <div class="letter-grid">
        <div class="letter-card"><span class="lg">بَ</span><span class="ln">فتحه → «بَ» مثل «ب+آ کوتاه»</span></div>
        <div class="letter-card"><span class="lg">بِ</span><span class="ln">کسره → «بِ» مثل «ب+ی کوتاه»</span></div>
        <div class="letter-card"><span class="lg">بُ</span><span class="ln">ضمه → «بُ» مثل «ب+و کوتاه»</span></div>
      </div>
      <p style="margin-top:14px;">فتحه یک خط کوچک <b>بالای</b> حرف است، کسره همان خط ولی <b>زیر</b> حرف، و ضمه شبیه یک «و» ریز <b>بالای</b> حرف.</p>
      <p>همین سه حرکت را روی حرف «م» هم ببینید: مَ — مِ — مُ</p>
    `,
    quiz: [
      { q: "حرکتی که زیر حرف قرار می‌گیرد چه نام دارد؟", options: ["فتحه", "کسره", "ضمه"], correct: 1 },
      { q: "«لُ» با کدام حرکت خوانده می‌شود؟", options: ["فتحه", "ضمه", "کسره"], correct: 1 }
    ]
  },
  {
    id: 5,
    title: "تنوین و سکون",
    icon: "ً",
    content: `
      <p><b>تنوین</b> یعنی حرکت را دو بار پشت سر هم خواندن، مثل اینکه در آخر کلمه صدای «ن» اضافه شود:</p>
      <div class="letter-grid">
        <div class="letter-card"><span class="lg">بًا</span><span class="ln">تنوین فتحه → «بَن»</span></div>
        <div class="letter-card"><span class="lg">بٍ</span><span class="ln">تنوین کسره → «بِن»</span></div>
        <div class="letter-card"><span class="lg">بٌ</span><span class="ln">تنوین ضمه → «بُن»</span></div>
      </div>
      <p style="margin-top:14px;"><b>سکون</b> (ـْـ) یعنی حرف هیچ حرکتی ندارد و ساکن است، مثلاً «اَبْ» که «ب» در آن ساکن خوانده می‌شود بدون صدای اضافه.</p>
    `,
    quiz: [
      { q: "تنوین چه صدایی به آخر کلمه اضافه می‌کند؟", options: ["ن", "م", "ل"], correct: 0 },
      { q: "علامت سکون یعنی حرف چطور خوانده می‌شود؟", options: ["دو بار", "بدون هیچ حرکتی", "کشیده"], correct: 1 }
    ]
  },
  {
    id: 6,
    title: "تشدید و ترکیب حروف",
    icon: "ّ",
    content: `
      <p><b>تشدید</b> (ـّـ) یعنی حرف را با فشار و دوبرابر تلفظ کنیم، مثل «رَبَّ» که «ب» با فشار و کشیده‌تر خوانده می‌شود.</p>
      <p>حالا حروف را کنار هم می‌گذاریم تا کلمه بسازیم. مثال‌های ساده:</p>
      <div class="letter-grid">
        <div class="letter-card"><span class="lg">قَلَمْ</span><span class="ln">قَ + لَ + مْ</span></div>
        <div class="letter-card"><span class="lg">كَتَبَ</span><span class="ln">کَ + تَ + بَ</span></div>
        <div class="letter-card"><span class="lg">نُورٌ</span><span class="ln">نُ + و + رٌ</span></div>
      </div>
      <p style="margin-top:14px;">سعی کنید هر کلمه را آرام، حرف‌به‌حرف، و بعد یک‌جا بخوانید. عجله نداشته باشید؛ روانی خواندن با تکرار می‌آید.</p>
    `,
    quiz: [
      { q: "تشدید یعنی حرف چگونه خوانده می‌شود؟", options: ["با فشار و دوبرابر", "خیلی آرام", "بدون صدا"], correct: 0 },
      { q: "کلمه‌ی «قَلَمْ» از چند بخش ساخته شده؟", options: ["دو بخش", "سه بخش", "چهار بخش"], correct: 1 }
    ]
  },
  {
    id: 7,
    title: "اولین تمرین خواندن: سوره‌ی حمد",
    icon: "﴾﴿",
    content: `
      <p>حالا وقت اولین تمرین واقعی است! سوره‌ی حمد (فاتحه) را آیه به آیه، آرام و با دقت بخوانید. لازم نیست حفظ کنید، فقط <b>بخوانید</b>:</p>
      <div class="verse-practice">
        <p>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p>الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ</p>
        <p>الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p>مَالِكِ يَوْمِ الدِّينِ</p>
        <p>إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ</p>
        <p>اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</p>
        <p>صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ</p>
      </div>
      <p style="margin-top:14px;">اگر جایی گیر کردید، به درس‌های قبلی برگردید و آن حرف یا حرکت را دوباره ببینید. تکرار، بهترین معلم است.</p>
    `,
    quiz: [
      { q: "سوره‌ی حمد چند آیه دارد؟", options: ["۵ آیه", "۷ آیه", "۹ آیه"], correct: 1 },
      { q: "هدف این تمرین چیست؟", options: ["حفظ‌کردن", "فقط خواندن و تمرین تلفظ", "ترجمه‌کردن"], correct: 1 }
    ]
  },
  {
    id: 8,
    title: "دومین تمرین خواندن: سوره‌ی اخلاص",
    icon: "﴾﴿",
    content: `
      <p>یک سوره‌ی کوتاه دیگر را تمرین کنید. باز هم آرام و حرف‌به‌حرف پیش بروید:</p>
      <div class="verse-practice">
        <p>قُلْ هُوَ اللَّهُ أَحَدٌ</p>
        <p>اللَّهُ الصَّمَدُ</p>
        <p>لَمْ يَلِدْ وَلَمْ يُولَدْ</p>
        <p>وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ</p>
      </div>
      <p style="margin-top:14px;">🎉 تبریک! دوره‌ی «شروع یادگیری» را تمام کردید. حالا آماده‌اید که از بخش «شروع حفظ» برای به‌خاطرسپاری سوره‌ها استفاده کنید.</p>
    `,
    quiz: [
      { q: "سوره‌ی اخلاص چند آیه دارد؟", options: ["۳ آیه", "۴ آیه", "۶ آیه"], correct: 1 },
      { q: "بعد از این درس، قدم بعدی چیست؟", options: ["شروع حفظ در بخش دوم برنامه", "یادگیری زبان انگلیسی", "هیچ‌کدام"], correct: 0 }
    ]
  }
];
