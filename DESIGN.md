# Makmoura Design

Makmoura is a family product. It should feel calm and premium to parents, and obvious to a six-year-old. The interactive prototype in [`prototype/index.html`](prototype/index.html) is the reference for everything below. Open it in a browser and switch between each child and the parent view.

Feature specs:
- [Family Rewards](docs/family-rewards.md)

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

Information priority for children is **icon → visual → number → text**. A child should recognise «هذا أنا», «هاي مهمتي», «هذا هدفي» and «هاي مكمورتي» before reading a word.

- Touch targets are at least **64pt** (task tiles are about 170×148pt).
- No small checkboxes, no swipe-only actions, no long-press, no hidden gestures. Every action is a visible tap.
- Labels are one word where possible: أسناني، سريري، صلاتي، شنطتي.
- Task states are shown by shape and colour, not words:

| State | Tile | Badge |
|---|---|---|
| To do | White, full-colour icon, `+2` coins in the corner | none |
| Done by child, waiting for a parent | Warm gold wash with a gold outline | ⏳ hourglass (turns slowly) |
| Approved | Faded, icon dimmed | ✓ green |

A child taps a tile to mark it done (it becomes ⏳ with a small confetti burst). Tapping a ⏳ tile again undoes it. Only a parent can move ⏳ to ✓, and the balance grows only then.

### Child Home

The child's own space, not a dashboard. It has three tabs, each with a large icon:

| Tab | Icon | Holds |
|---|---|---|
| **بيتي** (Home) | house | 1. Identity · 2. Makmoura Card · 3. Today · 4. Family surprise (only when there is one) |
| **عيلتي** (Family) | users | "Together today" ring, surprise teaser, sibling carousel |
| **أيامي** (My days) | calendar | Today, yesterday, earlier days, family moments |

Goal detail (section 5) is one tap away: tap the Makmoura Card and a sheet shows a large ring with the goal icon, `84 of 120`, and roughly how many days are left.

1. **Identity**: 64pt photo, first name at 32pt, a short greeting (صباح الخير / مسا الخير).
2. **Makmoura Card**: the product's visual signature (see below).
3. **Today**: two columns of large task tiles. When everything is done, one green line appears above them: «خلّصت كل مهامك!».
4. **Family surprise**: the Family Reward card, only on a reward day.

### Makmoura Card

The recognisable signature of the product. A deep navy card with a faint gold ring motif and a soft gold glow, 32pt radius. It holds, top to bottom:

- the Makmoura mark (jar glyph + «مكمورة» in gold) and the child's photo with a gold ring
- the balance: a gold coin and a 60pt number that counts up when it grows
- the goal: goal icon, goal name, «باقي 36», and a gold progress bar with a slow sheen
- today: one small circle per task, showing that task's icon (gold filled = approved, gold outline = waiting, faint = to do), and `3/5`

It is deliberately *not* a bank card: no card number, no chip, no brand logos, no credit-card aspect ratio.

### Family tab and siblings

- **Together today**: one ring for the whole family (all tasks, all children). Title changes from «سوا اليوم» to «أحسنتم يا أبطال!» when everyone is done.
- **Surprise teaser**: a wrapped gift when the parent has set a secret family surprise.
- **Sibling carousel**: horizontal swipe with snap and a page indicator. The child's own card comes first, marked «أنا», then siblings in fixed family order. Each card shows the photo with a progress ring, first name, task icons with their state, and `3 / 5`.
- **Sibling balances and goals are never shown** by default.

## Parent experience

Calm, premium, efficient, trustworthy. Parent Home, top to bottom:

1. **Date + «العيلة اليوم»**
2. **The family at a glance**: each child's photo inside a progress ring with `3/5`. The ring turns green when the child is fully done.
3. **The one primary action: «بانتظار موافقتك»**. The only elevated card on the screen, with a gold count badge. Each row shows the child's photo, the task icon and a large ✓, plus one «موافقة على الكل» button. When nothing is waiting it becomes a quiet line: «ما في شي بانتظارك · كل شي تمام».
4. **Family Reward card** (on a reward day), with «تمّت المفاجأة».
5. **Tomorrow's surprise**: one row with the reward icon, the condition in words, and a segmented progress bar. The parent can see progress; children can't see who is behind.

### Creating a family surprise

One sheet, two visual choices, one button. No forms.

1. **شو المفاجأة؟**: a 3-column grid of reward icons.
2. **إمتى؟**: five large rows (everyone finished · task count · weekly target · selected tasks · surprise now). A count stepper or task-icon picker appears inline only when that row is chosen.
3. **خليها سر**: on by default.
4. **جاهز**, or **فاجئهم الآن** for an instant surprise.

## Visual system

### Colour

Warm light grounds. Photos, icons and progress bring the colour. Navy and gold are accents, and neither should be overused.

| Token | Value | Use |
|---|---|---|
| `navy` | `#0B1A32` | Makmoura Card, primary buttons, text |
| `navy-2` | `#172B4F` | Card gradient |
| `gold` | `#ECAC4E` | Achievement: coins, progress, rewards, the ⏳ state |
| `gold-deep` | `#9A6412` | Gold text on light surfaces (meets contrast) |
| `gold-soft` / `gold-mist` | `#FCEFD8` / `#FFF8EC` | Reward and waiting surfaces |
| `bg` | `#F5F1EA` | App background |
| `surface` / `surface-2` | `#FFFFFF` / `#FAF7F2` | Cards / completed tiles |
| `ink-2` / `ink-3` | `#4A5468` / `#8A92A3` | Secondary / tertiary text (navy-biased greys) |
| `green` / `green-soft` | `#2E8A66` / `#E4F3EC` | Approved only |

Each task has a soft tint pair (background + icon colour) so children can recognise it by colour as well as shape: أسناني blue, سريري lavender, صلاتي green, القراءة coral, شنطتي amber, ألعابي rose, المي teal.

### Type

- **Readex Pro**: display, names, numbers (tabular figures).
- **IBM Plex Sans Arabic**: body and labels.
- Scale: 60 (balance) · 32 (name) · 26 (reward) · 22 (section) · 18 (tile label) · 15 (body) · 13 (meta).
- Digits: Western digits in the prototype. Arabic-Indic digits should become a family setting.

### Shape, depth, motion

- Radius: 32 (hero cards, sheets) · 24 (tiles) · 18 (rows) · pills for buttons.
- Depth comes from two soft shadows only. Just the Makmoura Card and the approvals card use the stronger one.
- Motion: spring on tile taps and badges, count-up on the balance, sheen on goal progress, a single confetti burst for completions and the reveal. Everything respects `prefers-reduced-motion`.

### Iconography

- Production uses one coherent outline set: [Lucide](https://lucide.dev) (24pt grid, 2pt stroke, round caps), plus custom Makmoura glyphs drawn on the same grid where Lucide has no match. The prototype already includes three: **toothbrush**, **mosque** (prayer) and **jar** (the Makmoura mark).
- Emoji appear only in specs and demo copy, never in production UI.
- Icon vocabulary: toothbrush = teeth · bed = bed · book-open = reading · backpack = school bag · mosque = prayer · toy-brick = tidy toys · droplet = water · target = goal · star = achievement · gift = reward · users = family · coins = virtual balance · check = approved · hourglass = waiting for a parent.

### Photography

Child photos carry most of the warmth, so they're used large: identity (64pt), the Makmoura Card, sibling cards (96pt), and the overlapped faces on the Family Reward card. Without a photo, the app shows the child's initial on their own soft gradient. The prototype lets you upload photos from the side panel.
