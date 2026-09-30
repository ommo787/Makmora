import type { IconName } from '@/ui/icons';

/** Ready-made tasks. `ages` is the range where the task is suggested by default. `did` reads as a sentence about a boy, `didF` about a girl. */
export type TaskTemplate = { key: string; didF: string; name: string; icon: IconName; ages: [number, number]; did: string; reward: number };

export const TASK_TEMPLATES: TaskTemplate[] = [
  { key: 'teeth', didF: 'فرّشت سنانها', name: 'تفريش الأسنان', icon: 'toothbrush', ages: [3, 15], did: 'فرّش سنانه', reward: 2 },
  { key: 'bed', didF: 'رتّبت سريرها', name: 'ترتيب السرير', icon: 'bed', ages: [5, 15], did: 'رتّب سريره', reward: 2 },
  { key: 'pray', didF: 'صلّت', name: 'الصلاة', icon: 'mosque', ages: [7, 15], did: 'صلّى', reward: 3 },
  { key: 'read', didF: 'قرأت', name: 'القراءة', icon: 'book-open', ages: [6, 15], did: 'قرأ', reward: 2 },
  { key: 'bag', didF: 'جهّزت شنطتها', name: 'تجهيز الشنطة', icon: 'backpack', ages: [6, 15], did: 'جهّز شنطته', reward: 2 },
  { key: 'hw', didF: 'خلّصت وظايفها', name: 'الوظايف', icon: 'pencil', ages: [8, 15], did: 'خلّص وظايفه', reward: 3 },
  { key: 'toys', didF: 'رتّبت ألعابها', name: 'ترتيب الألعاب', icon: 'toy-brick', ages: [3, 7], did: 'رتّب ألعابه', reward: 2 },
  { key: 'water', didF: 'شربت مي', name: 'شرب المي', icon: 'droplets', ages: [3, 6], did: 'شرب مي', reward: 2 },
  { key: 'dress', didF: 'لبست لحالها', name: 'لبس لحالي', icon: 'shirt', ages: [3, 6], did: 'لبس لحاله', reward: 2 },
  { key: 'table', didF: 'جهّزت السفرة', name: 'تجهيز السفرة', icon: 'utensils', ages: [99, 99], did: 'جهّز السفرة', reward: 2 },
  { key: 'plant', didF: 'سقت الزرع', name: 'سقاية الزرع', icon: 'sprout', ages: [99, 99], did: 'سقى الزرع', reward: 2 },
  { key: 'sleep', didF: 'نامت بكير', name: 'النوم بكير', icon: 'moon', ages: [99, 99], did: 'نام بكير', reward: 2 },
];

/** A written task or goal gets its icon from its words (in production this can move to an on-device model). */
const TASK_WORDS: [RegExp, IconName][] = [
  [/صلا|صلي|قرآن|قران|سورة|دعاء/, 'mosque'], [/أسنان|اسنان|تفريش|فرشا/, 'toothbrush'], [/سرير|تخت/, 'bed'],
  [/قراء|قصة|قصص|كتاب|مطالعة/, 'book-open'], [/شنط|حقيبة/, 'backpack'], [/وظيف|وظايف|دراس|درس|واجب|حفظ|كتابة/, 'pencil'],
  [/ألعاب|العاب|لعب|ليغو/, 'toy-brick'], [/مي\b|ماء|شرب/, 'droplets'], [/لبس|ثياب|ملابس|غسيل|تياب/, 'shirt'],
  [/سفرة|أكل|اكل|غدا|عشا|فطور|صحون|جلي/, 'utensils'], [/زرع|نبات|سقاية|ورد/, 'sprout'], [/نوم|نام|بكير/, 'moon'],
  [/قط|بسة|كلب|حيوان|عصفور|سمك/, 'paw-print'], [/زبالة|قمامة|نفايات|تنظيف|نظافة|كنس|مسح/, 'trash'],
  [/دوش|حمام|استحمام|شاور/, 'shower'], [/ساعد|مساعدة|خدمة|إخوت|اخوت|جدة|تيتا|جدو/, 'hand-heart'],
  [/رياضة|مشي|ركض|تمارين|سباحة/, 'footprints'], [/طابة|كرة|فوتبول/, 'volleyball'],
];
const GOAL_WORDS: [RegExp, IconName][] = [
  [/بلاي|playstation|ps\d|اكس ?بوكس|xbox|نينتندو|nintendo|سويتش|switch|لعبة/i, 'gamepad'],
  [/ايباد|آيباد|ipad|تابلت/i, 'tablet'], [/موبايل|جوال|تلفون|ايفون|آيفون|iphone/i, 'smartphone'],
  [/لابتوب|كمبيوتر|laptop/i, 'laptop'], [/ساعة|watch/i, 'watch'], [/سماعات|سماعة|airpods/i, 'headphones'],
  [/سفر|رحلة|طيارة/i, 'plane'], [/ملاهي|ألعاب|العاب/i, 'ferris-wheel'], [/تخييم|خيمة/i, 'tent'],
  [/دراجة|بسكليت|سكوتر|bike/i, 'bike'], [/طابة|كرة|فوتبول/i, 'volleyball'], [/ليغو|lego|مكعبات/i, 'toy-brick'],
  [/قصص|كتاب|كتب/i, 'book'], [/ألوان|الوان|رسم/i, 'palette'], [/بوط|حذاء|شوز/i, 'footprints'],
  [/قطة|بسة/i, 'cat'], [/كلب/i, 'dog'], [/كيك|حلو/i, 'cake'], [/بازل|puzzle/i, 'puzzle'],
];
export const iconForTask = (name: string): IconName => TASK_WORDS.find(([re]) => re.test(name))?.[1] ?? 'sparkles';
export const iconForGoal = (name: string): IconName => GOAL_WORDS.find(([re]) => re.test(name))?.[1] ?? 'gift';

/** Family surprises a parent can prepare: six ready examples, or write your own. */
export const SURPRISES: { key: string; icon: IconName; title: string }[] = [
  { key: 'park', icon: 'trees', title: 'مشوار عالحديقة' },
  { key: 'out', icon: 'utensils', title: 'نتغدى برا' },
  { key: 'home', icon: 'cake', title: 'أكلة طيبة بالبيت' },
  { key: 'movie', icon: 'film', title: 'فيلم المسا سوا' },
  { key: 'ice', icon: 'ice-cream', title: 'آيس كريم' },
  { key: 'fun', icon: 'ferris-wheel', title: 'مدينة ألعاب' },
];
const SURPRISE_WORDS: [RegExp, IconName][] = [
  [/حديقة|جنينة|منتزه|نزهة|مشوار|طلعة/, 'trees'], [/غدا|عشا|فطور|مطعم|برا/, 'utensils'], [/بيتزا/, 'pizza'],
  [/فيلم|أفلام|افلام|سينما/, 'film'], [/بوشار|فشار/, 'popcorn'], [/آيس|ايس|بوظة|جيلاتي/, 'ice-cream'],
  [/ملاهي|مدينة (ألعاب|العاب)/, 'ferris-wheel'], [/لعب|ألعاب|العاب|بلاي|سهرة/, 'gamepad'], [/دراج|بسكليت/, 'bike'],
  [/حلو|كيك|كاتو|أكلة|اكلة|طبخ/, 'cake'], [/تخييم|خيمة|بر/, 'tent'], [/سفر|رحلة/, 'plane'],
];
export const iconForSurprise = (t: string): IconName => SURPRISE_WORDS.find(([re]) => re.test(t))?.[1] ?? 'gift';

export const AVATARS = {
  boy: require('../../assets/avatars/boy.png'),
  child: require('../../assets/avatars/child.png'),
  girl: require('../../assets/avatars/girl.png'),
  man: require('../../assets/avatars/man.png'),
  woman: require('../../assets/avatars/woman.png'),
} as const;
export type AvatarKey = keyof typeof AVATARS;

export const WEEKDAYS = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
export const TRIAL_DAYS = 14;
