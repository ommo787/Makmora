# تجهيز سيرفر مكمورة (Supabase)

ثلاث خطوات بلوحة Supabase، مرة وحدة بس.

## 1. الجداول والحماية
1. من القائمة عاليسار افتح **SQL Editor**.
2. اكبس **New query**.
3. افتح الملف `supabase/migrations/0001_family_events.sql` من المشروع على GitHub، انسخ كل محتواه، والصقه.
4. اكبس **Run**. لازم يطلع `Success. No rows returned`.

هالملف بيعمل:
- **families**: العيلة، مع رمزين: رمز الأولاد (6 أرقام) ورمز دعوة الأب أو الأم (8 أحرف).
- **members**: مين بالعيلة: أب، أم، أو جهاز ولد.
- **events**: كل شي بيصير بالعيلة، بالترتيب. كل الأجهزة بتقرأ نفس الترتيب، فبتشوف نفس الشي.
- **الحماية (RLS)**: كل عيلة بتشوف أحداثها بس. جهاز الولد بيقدر يعلّم مهامه هو بس، وما بيقدر يوافق.

## 2. طرق الدخول
من **Authentication**، بعدين **Sign In / Providers**:
1. فعّل **Allow anonymous sign-ins**. هيك أجهزة الأولاد بتفوت بالرمز بدون حساب ولا بريد.
2. بـ **Email**: خلال التجربة، شيل الصح عن **Confirm email**، لحتى الحساب يشتغل فوراً. قبل النشر منرجعها، ومنربط بريد مرسل خاص فيكم.

## 3. الشبكة (لحتى Claude يقدر يجرّب من هون)
بإعدادات البيئة: **Network access**، بعدين **Allowed domains**، وضيف `*.supabase.co`.

## شو لسا لاحقاً
- **الدخول بـ Google:** بدها مشروع على Google Cloud. منعمله مع حساب Google Play.
- **الدخول بـ Apple:** بدها حساب Apple Developer.
- **الإشعارات** ("ميرا رتّبت سريرها" وهي مسكّرة التطبيق).
- **حد لمحاولات رمز الأولاد:** لحتى ما حدا يجرّب أرقام عشوائية.

## 4. الدخول بـ Google (مطلوب قبل التجربة مع العيلة)
**أ. على Google Cloud** (console.cloud.google.com):
1. اعمل مشروع جديد اسمه `Makmoura`.
2. **APIs & Services** ← **OAuth consent screen**: اختار **External**، اسم التطبيق «مكمورة»، وبريدك. احفظ.
3. **Credentials** ← **Create credentials** ← **OAuth client ID** ← النوع **Web application**.
4. تحت **Authorized redirect URIs** ضيف بالزبط:
   `https://cqsxuhkaqpauubgmcxts.supabase.co/auth/v1/callback`
5. اكبس **Create**، وانسخ **Client ID** و**Client secret**.

**ب. على Supabase:**
1. **Authentication** ← **Sign In / Providers** ← **Google**: فعّله، والصق الـ Client ID والـ Client secret، واحفظ.
2. **Authentication** ← **URL Configuration**:
   - **Site URL:** `https://ommo787.github.io/Makmora/app/`
   - **Redirect URLs:** ضيف `https://ommo787.github.io/Makmora/app/**` و `makmoura://**`

## 5. الدخول بـ Apple
بدها حساب Apple Developer (99$ بالسنة). على الآيفون بتشتغل لحالها بعد ما ننشر.
