# Makmoura Design

Makmoura is a family product. It should feel calm and premium to parents, and obvious to a six-year-old. The interactive prototype in [`prototype/index.html`](prototype/index.html) is the reference for everything below. Open it in a browser. The side panel switches between a child's screen and the parent's screen and walks through the core loop in three steps.

Feature specs:
- [Family Rewards](docs/family-rewards.md)

## Current direction (supersedes the older colour, type and screen notes below)

The product follows native iOS design so it feels like an Apple app. The live references are the screen prototypes in [`prototype/screens/`](prototype/screens/) and the Makmoura identity design system.

- **Colour:** one brand colour, blue `#007AFF`, for buttons, links, selection and every icon (on a `#E6F1FF` tile). Gold only for the points coin, green only for "done", red only for delete. Everything else is white, `#F2F2F7` and greys.
- **Font:** Apple's system font (SF Arabic / SF Pro) on Apple devices; IBM Plex Sans Arabic and Inter elsewhere.
- **Controls (iOS 26 style):** capsule buttons, frosted-glass secondary buttons, a round glass back button, grouped lists with 26px corners, and the system sheets (Sign in with Apple, App Store).
- **App icon:** a blue rounded square with a white jar and a blue star inside: the jar the child fills, the star the dream (`prototype/app-icon.svg`).
- **People:** children and parents appear by photo; until a family adds photos, 3D avatars stand in.
- **Flow (value before price):** Welcome → Account (Apple, Google, email) → About you → Children → Task setup per child (tasks, reward per task, goal) → All set (edit / approve) → Child preview ("this is what Salim sees tomorrow") → Free trial → App Store → Trial started (optional invite for the other parent).
- **Deferred on purpose:** the parent passcode is asked at the first approval (with Face ID); inviting the other parent is offered after the trial starts.
- **Money:** task rewards and goals are real amounts in the currency of the phone's region, with no picker. Saudi riyal uses the official new sign. The app keeps a ledger; parents pay children themselves. No fixed allowance in v1: every riyal comes from a task.
- **Wording:** "مكافأة كل مهمة" (not "how much is it worth"); "هدف سليم" (something he aims for), written freely, icon picked from the words.

## Principles

**One thing per screen.** Every screen answers: *what is the one most important thing to see or do here?* Anything that doesn't serve that goes to a deeper level or goes away.

**Fix usability with design, not words.** When something is unclear, change the hierarchy, icon, layout, visual state or motion. Don't add explanatory text.

**Simplicity wins.** More features vs simplicity → simplicity. More text vs a clear visual → the visual. A generic dashboard vs a family experience → the family.

**Not this:** a school management system, a fintech dashboard, a banking or crypto wallet, a task-management SaaS, a colourful kindergarten app, or a generic React Native template.

### The two tests

Every screen has to pass its test before it ships.

| Screen | Test | If it fails |
|---|---|---|
| Child | *A 6-year-old who reads a little Arabic knows what to tap.* | Remove choices, enlarge the icon, make the state more visible. |
| Parent | *A busy parent sees what needs attention in under 5 seconds.* | Move that item to the top, and fold everything else away. |

## Child experience: icon first

Information priority for children is **icon → visual → number → text**. Children see colourful illustrations, never thin line icons. A child should recognise «هذا أنا», «هاي مهمتي», «هذا هدفي» and «هاي مكمورتي» before reading a word.

- Touch targets are at least **64pt** (task tiles are about 170×156pt, with 84pt illustrations).
- No small checkboxes, no swipe-only actions, no long-press, no hidden gestures. Every action is a visible tap.
- Labels are one word where possible: أسناني، سريري، صلاتي، شنطتي.
- Task states are shown by shape and colour, not words:

| State | Tile | Badge |
|---|---|---|
| To do | White tile, full-colour illustration | none |
| Done by child, waiting for a parent | Warm gold wash with a gold outline | ⏳ hourglass illustration (turns slowly) |
| Approved | Faded, illustration desaturated | ✓ green check illustration |

A child taps a tile to mark it done (it becomes ⏳ with a small confetti burst). Tapping a ⏳ tile again undoes it. Only a parent can move ⏳ to ✓, and the balance grows only then.

### Child Home: one screen, no tabs

The child has **one** screen. Nothing to navigate, nothing to learn.

1. **Me**: 58pt photo, first name at 30pt, a short greeting. On the other side, a round button with the siblings' faces opens *My family*.
2. **The Makmoura**: the product's signature (see below). Tapping it opens *My goal*.
3. **My tasks today**: large illustrated tiles, two per row (an odd last tile spans the full width). A row of small dots beside the title shows progress without numbers.
4. **Family surprise**: only on a reward day, below the tasks.

Everything else is one tap away, as a sheet over Home:

| Sheet | Opened by | Holds |
|---|---|---|
| **هدفي** (My goal) | Tapping the Makmoura | Large goal illustration, `84 of 120`, a progress bar, «باقي 36 · تقريباً 4 أيام», and *My days* (today, yesterday, earlier; each day shows its task icons, coins earned and any family moment) |
| **عيلتي** (My family) | The faces button | One collective bar «سوا اليوم 9 من 14», the surprise teaser, and a swipeable card per sibling |

### The Makmoura (the jar)

*Makmoura* is a savings jar, so the signature is a real jar: glass body, navy lid with a gold line, and gold coins that pile up inside. The height of the pile *is* the progress toward the goal: a full jar means the goal is reached. The balance sits on the jar's label.

Next to the jar is the **goal**: a large illustration in a white circle with a gold halo (a bicycle, a box of colours, a camera), its name, and a pill «باقي 36 🪙».

A child reads it without text: *my jar → my bike*. When a parent approves a task, the next time the child opens the app the coins rise, the number counts up, and a small confetti burst plays over the jar.

It is deliberately light and warm, not a dark bank card: no card number, no chip, no logos.

### Family sheet and siblings

- **Together today**: one bar for the whole family (all tasks, all children). Title changes from «سوا اليوم» to «أحسنتم يا أبطال!» when everyone is done.
- **Surprise teaser**: a wrapped gift when the parent has set a secret family surprise.
- **Sibling cards**: horizontal swipe with snap and a page indicator. The child's own card comes first, marked «أنا», then siblings in fixed family order. Each shows the photo, first name, and the task illustrations with ✓ or ⏳.
- **Sibling balances and goals are never shown.**

## Parent experience

Calm, premium, efficient, trustworthy. Parent Home, top to bottom:

1. **Date + «العيلة اليوم»**
2. **The family at a glance**: each child's photo inside a progress ring with «3 من 5». When a child is done, the ring turns green and the line reads «خلّص كل شي».
3. **The one primary action: «بانتظار موافقتك»**. The only elevated card, with a gold count badge. Each row shows the task illustration, the child's face and name, and a large ✓. One «وافق على الكل» button. When nothing is waiting it becomes a quiet line: «كل شي تمام · ما في شي بانتظارك».
4. **Family Reward card** (on a reward day), with «تمّت المفاجأة».
5. **One row for the family surprise**: «جهّز مفاجأة للعيلة», or the one already prepared.

### Creating a family surprise

One sheet, two visual choices, one button. No forms.

1. **شو المفاجأة؟**: a 3-column grid of reward illustrations.
2. **إمتى بتطلع؟**: five large rows (everyone finished · task count · weekly target · selected tasks · surprise now). A count stepper or task picker appears inline only when that row is chosen.
3. **جاهز**, or **فاجئهم هلأ** for an instant surprise. Surprises are secret by default.

## Visual system

### Colour

Warm light grounds. Photos, illustrations and progress bring the colour. Navy and gold are accents, and neither should be overused.

| Token | Value | Use |
|---|---|---|
| `navy` | `#0B1A32` | Jar lid, primary buttons, text |
| `gold` | `#ECAC4E` | Achievement: coins, progress, rewards, the ⏳ state |
| `gold-deep` | `#9A6412` | Gold text on light surfaces |
| `gold-soft` / `gold-mist` | `#FDEFD6` / `#FFF8EC` | Goal halo, reward and waiting surfaces |
| `bg` | `#FBF7F0` | App background |
| `surface` | `#FFFFFF` | Cards and tiles |
| `ink-2` / `ink-3` | `#55607A` / `#98A0B0` | Secondary / tertiary text (navy-biased greys) |
| `green` / `green-soft` | `#2E9E6E` / `#E3F5EC` | Approved only |

### Type

- **Baloo Bhaijaan 2**: names, titles, numbers, buttons. Rounded and warm, so it reads friendly to children while staying tidy.
- **IBM Plex Sans Arabic**: body text and small labels.
- Scale: 36 (reveal) · 30 (name, balance) · 24 (section, goal) · 20 (tile label) · 15 (body) · 13 (meta).
- Digits: Western digits in the prototype. Arabic-Indic digits should become a family setting.

### Shape, depth, motion

- Radius: 34 (hero cards, sheets) · 28 (tiles) · 18–22 (rows) · pills for buttons.
- Two soft shadows only. The Makmoura, the Family Reward card and the approvals card use the stronger one.
- Motion: spring on tile taps and badges, coins rising in the jar with a count-up, a gentle bob on reward illustrations, one confetti burst for completions and the reveal. Everything respects `prefers-reduced-motion`.

### Illustration

- Children's UI uses **colourful 3D-style illustrations**, not line icons. They are large (84pt on task tiles, 124–210pt for rewards) and readable without text.
- The prototype uses Microsoft Fluent Emoji 3D (MIT licence) as stand-in art. Production should commission one consistent custom Makmoura illustration set in the same spirit: soft 3D, warm light, rounded forms.
- Line glyphs (✓, ✕, ‹, +) appear only on controls such as buttons and sheet close.
- Vocabulary: toothbrush = teeth · bed = bed · books = reading · backpack = school bag · mosque = prayer · teddy bear = tidy toys · droplet = water · coin = balance · green check = approved · hourglass = waiting for a parent · wrapped gift = family surprise.

### Photography

Child photos carry most of the warmth: the top of Home, sibling cards (96pt), the parent's rings, and the overlapped faces on the Family Reward card. Without a photo, the app shows the child's initial on their own soft gradient.
