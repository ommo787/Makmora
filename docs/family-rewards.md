# Family Rewards

Shared rewards the whole family earns together. They sit next to personal rewards and use a different idea:

| | Idea | Where it shows |
|---|---|---|
| **Personal** | I finish my tasks → my balance grows → I get closer to my goal. | The child's Makmoura jar |
| **Family** | We finish our responsibilities together → something nice happens for the family. | The Family Reward card, on child Home and parent Home |

A family reward is never counted in coins and never goes into anyone's balance. It is a moment: pizza for lunch, a movie night, a trip to the park.

## Rules that do not bend

1. **No sibling competition.** The app never ranks children, never says who won or lost, and never says who stopped the family from earning a reward.
   - Use: «أنجزناها سوا 🎉» · «أحسنتم يا أبطال!» · «مفاجأة العائلة جاهزة» · «لأنكم أنجزتوا مهامكم مبارح…»
   - Never: «سليم ربح ولؤي خسر», «بسبب لؤي ما في مفاجأة», any leaderboard or sorted list of children.
2. **Silence when the goal is missed.** Children see nothing about a missed family goal. No "almost", no countdown, no sad state.
3. **Occasional.** A family reward is a treat. If it appears every day it turns into another points system (see [Frequency](#frequency)).
4. **Siblings stay in a fixed order** (the family order the parent set) everywhere. Never sort children by progress.
5. **Only approved tasks count.** A task a child marked done but a parent hasn't approved yet (⏳) does not count toward a family goal.

## Conditions

The parent picks one condition per surprise. Each option is a large visual row in the builder, not a form.

| Condition | Id | Met when | Why line on the card |
|---|---|---|---|
| Everyone finished everything | `all_required` | Every participating child has all *required* tasks approved for the day | لأنكم أنجزتوا كل مهامكم مبارح |
| Family task count | `family_count` | Approved tasks across participating children ≥ `count` for the day | لأنكم أنجزتوا 15 مهمة سوا مبارح |
| Weekly target | `weekly_target` | Approved ÷ assigned tasks for the family week ≥ `percent` (default 80%) | لأنكم وصلتوا هدف الأسبوع سوا |
| Selected tasks | `selected_tasks` | Every participating child who had any of `taskIds` that day has them approved | لأنكم كلكم عملتوا 🛏️ 🪥 مبارح *(task icons, not words)* |
| Parent surprise | `manual` | The parent taps «فاجئهم الآن» | مفاجأة من ماما وبابا لأنكم أبطال |

"Participating children" is a per-surprise list the parent controls (default: every child). A child who is sick or travelling can be left out without anyone being blamed.

## Lifecycle

```
 parent creates ──► armed ──(day closes, condition met)──► earned ──(parent marks done)──► memory
                      │                                        │
                      └──(day closes, not met)──► stays armed   └──(end of reward day)──► memory
```

- **armed**: the parent has set up a surprise for a future day. If it's marked *secret* (the default), children see only a wrapped gift on the family sheet: «في مفاجأة للعيلة إذا خلّصنا مهامنا سوا». If it isn't secret, they see the reward itself.
- **Evaluation**: runs when the family day closes (midnight in the family's time zone). Approvals given the next morning for yesterday's tasks still count: evaluation re-runs on each approval until the first child opens the app that day.
- **earned**: the reward is live for the reward day.
  - Each child sees a full-screen **reveal** the first time they open the app that day (large reward illustration, confetti, one button «يا سلام!»). It never shows twice to the same child.
  - After that, the **Family Reward card** stays on child Home below the tasks, and on parent Home below the approvals.
- **memory**: when the parent taps «تمّت المفاجأة» or the day ends, the card leaves Home and becomes a line in each child's history (أيامي): «أنجزناها سوا · بيتزا».
- A missed day leaves the surprise armed for the next day. There is no failure state.

## Frequency

- At most **one** family reward per day.
- At most **one armed** surprise at a time. Creating a new one replaces the old one.
- Soft cap: after 2 earned rewards in a family week, the builder shows a quiet hint: «المفاجآت أحلى لما تكون قليلة». The parent can ignore it. The app never blocks a parent.
- `manual` ignores the cap but still counts toward it.

## The Family Reward card

It should read as a family moment, not a coupon: no dashed borders, no "redeem" button, no expiry timer, no price.

```
     🎉          🎉
        ( 🍕 )           ← large reward illustration on a soft gold glow, gently bobbing
     مفاجأة اليوم!        ← 26pt, extra bold
 لأنكم خلّصتوا كل مهامكم مبارح   ← why, 15pt, ink-2
 [ بيتزا على الغدا اليوم ]     ← the reward, on a white chip, 22pt
   (س)(ل)(ج) أنجزناها سوا      ← every child's photo, overlapped
```

- Surface: warm gold wash fading to white, two party-popper illustrations in the top corners, radius 34.
- Parent variant: same card, plus one quiet button «تمّت المفاجأة».
- Reveal variant: the same content full-screen with a 210pt illustration, one confetti burst and one big button «يا سلام!». Reduced motion shows it still.

## Reward catalogue (starter set)

Each reward has an icon, a short label for the builder grid, and the full line shown on the card.

| Illustration | Builder label | Card line |
|---|---|---|
| pizza | بيتزا | بيتزا على الغداء اليوم |
| ice-cream-cone | آيس كريم | آيس كريم بعد العشا |
| clapperboard | ليلة أفلام | ليلة أفلام عائلية |
| egg-fried | فطور مميز | فطور مميز بكرة الصبح |
| trees | نزهة | نزهة نهاية الأسبوع |
| ferris-wheel | مدينة ألعاب | زيارة مدينة ألعاب |
| gamepad-2 | لعب عائلي | وقت لعب عائلي |
| popcorn | اختاروا فيلم | اختاروا فيلم الليلة |
| cake-slice | حلوى | حلوى بعد العشا |
| bike | طلعة دراجات | طلعة دراجات سوا |
| palette | نشاط ممتع | نشاط عائلي ممتع |

Parents can add their own later (icon picker + one line). That is out of scope for the first version.

## Data model

```ts
type FamilyRewardCondition =
  | { type: 'all_required' }
  | { type: 'family_count'; count: number }
  | { type: 'weekly_target'; percent: number }          // 0–100, default 80
  | { type: 'selected_tasks'; taskIds: string[] }
  | { type: 'manual' };

interface FamilySurprise {
  id: string;
  familyId: string;
  rewardKey: string;             // catalogue key, e.g. 'pizza'
  title: string;                 // card line, e.g. 'بيتزا على الغداء اليوم'
  condition: FamilyRewardCondition;
  participantIds: string[];      // children included in this surprise
  secret: boolean;               // children see a wrapped gift until earned
  status: 'armed' | 'earned' | 'memory' | 'cancelled';
  earnedForDate?: string;        // family-local date the goal was met (YYYY-MM-DD)
  rewardDate?: string;           // the day it is shown (usually earnedForDate + 1)
  revealedTo: string[];          // child ids who have seen the full-screen reveal
  createdBy: string;             // parent id
  createdAt: string;
  completedAt?: string;          // parent tapped «تمّت المفاجأة»
}
```

Evaluation is a pure function over one family day, so it is easy to test:

```ts
function isMet(c: FamilyRewardCondition, day: FamilyDay, week: FamilyWeek): boolean
// FamilyDay: per participating child, the required task ids and the approved task ids.
// Returns only a boolean for the family. Never return per-child blame to the UI.
```

The prototype's `familyGoalProgress()` in `prototype/index.html` implements these rules against live state.
