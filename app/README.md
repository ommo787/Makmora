# مكمورة (Makmoura), the app

The real iOS and Android app, built with Expo (React Native) and expo-router. Arabic first, right to left, in the Salimfy identity (Deep Navy #0B1A32 and Warm Gold #ECAC4E, IBM Plex Sans Arabic).

## Run it

```bash
cd app
npm install
npx expo start          # scan the QR code with Expo Go, or press i / a
npx expo start --web    # quick look in the browser
```

Handy routes while developing:

| Route | What it does |
| --- | --- |
| `/demo` | Loads a sample family (Ahmad, Salim 9, Louai 6) and opens the parent home |
| `/demo?as=child` | Same family, opened as Salim's screen |
| `/demo?fresh=1` | Clears everything and starts onboarding from the welcome screen |

Checks: `npx tsc --noEmit` and `npx expo lint`.

## Screens

Onboarding: `welcome` → `account` (Apple, Google, email) → `about` (parent name, بابا/ماما) → `children` → per child `setup/[id]/tasks` → `rewards` → `goal` → `setup/all-set` → `setup/preview` (what the child will see) → `paywall` (14-day free trial) → `started` (optional partner invite).

Parent (tabs): `today` (one-tap approvals, family surprise), `kids`, `settings`; plus `kid/[id]` and `surprise`.

Child: `child/join` (6-digit family code) and `child/home` (goal jar, big task tiles, surprise reveal).

## Code map

```
src/app/          routes (expo-router)
src/theme/        tokens: colours, type scale, spacing, radii, shadows
src/ui/           kit (buttons, rows, sheets, money), icons, child view, setup helpers
src/state/        zustand store, persisted on device
src/services/     auth, purchases, biometrics, money, haptics
src/data/         ready-made tasks, auto icons, surprises, avatars
```

## What is real and what is mocked today

| Area | Status |
| --- | --- |
| All screens, flows, RTL, fonts, animations | Real |
| Data | Saved on the device only (AsyncStorage). No server yet |
| Sign in with Apple | Real on iOS builds, mocked elsewhere |
| Google and email sign-in | Mocked, needs a backend |
| Approvals | One tap, no Face ID. Face ID only guards leaving the child screen for the parents board |
| Subscription and free trial | RevenueCat wired in `src/services/purchases.ts`; mocked until keys are set |
| Currency | From the phone region, Saudi riyal uses the official sign |
| Parent and child on different phones | Needs the backend below |

## Next steps to ship

1. **Backend for sync** (parent phone ↔ child tablet ↔ partner): Supabase (Postgres + auth + realtime) fits well. Tables: families, members, children, tasks, completions, surprises. The family code joins a child device.
2. **Payments**: create the products in App Store Connect and Google Play (monthly and yearly with a 14-day free trial), add them to RevenueCat, then set
   `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY`.
3. **Builds**: `npm i -g eas-cli && eas build -p ios` (needs an Apple Developer account) and `eas submit`.
4. Prices on the paywall ($4.99 a month, $39.99 a year) are placeholders to confirm.

Icons: Lucide (ISC). Avatars: Microsoft Fluent Emoji 3D (MIT). Saudi riyal sign: SIL OFL. See `../prototype/THIRD_PARTY_NOTICES.md`.
