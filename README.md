# Pennywise

A personal finance tracker built with Next.js and TypeScript.

## What it does

Pennywise tracks income, spending and budget limits in one place. Data is stored per user in Firebase. The dashboard leads with the one number that matters, net balance (income − expenditure), and breaks everything else down underneath: cash flow by month, where the money went, what's close to its limit.

## Features

- **Dashboard.** Net balance on a rolling "total drum", money in / out / kept, the whole budget as one meter, six-month cash flow chart (with a table view), budget lines closest to their limit, where spending went by bucket and line, income by source, and the latest entries. A first-run checklist teaches setup until there's data.
- **Ring up.** One entry form for income and spending, reachable from every screen (green key in the nav, or press `N`). Amount first, then bucket and budget line (or income source), then narration. A successful entry prints a receipt and is stamped approved.
- **Income / Expenses.** Journal-style lists grouped by day with daily subtotals; expenses filter by bucket.
- **Budget.** Limits across three buckets (Daily needs, Planned payments, Others). Each line shows limit, spent and a segmented meter, and says "Over by …" when a limit is blown. Rows stack as cards on phones. Empty buckets offer starter lines.
- **History.** Every entry on one roll: search, filter by type and month, totals for the current filter, CSV export.
- **Notifications.** Activity feed for income and expense entries, with an unread count on the bell, per-item read/unread, and mark-all-read. Can be switched off in Settings.
- **Settings.** Light/dark theme, currency (NGN, USD, EUR), notifications, password reset, account deletion.
- **Authentication.** Sign up, log in and forgot-password via Firebase Auth; demo credentials are pre-filled on the login screen.
- **Savings.** Not built yet (the page says so).

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS, design tokens as CSS custom properties
- Firebase (Auth + Firestore)
- Zustand for client state (auth, finance data, preferences, UI)
- `motion` for animation, lucide-react icons, react-hot-toast

## Getting started

```bash
npm install
npm run dev
```

Add your Firebase config to a `.env` file before running:

```
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_APP_ID=…
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=…
```

### Previewing with sample data (development only)

`npm run dev` shows a small dashed switcher in the bottom-right corner: **Live** (your Firestore data), **Sample** (six months of synthetic entries) or **Empty** (a brand-new account). You can also use `?sample=full`, `?sample=empty` or `?sample=off` on any dashboard URL. Sample mode needs no login, writes nothing to Firestore (entries you add live in memory until reload), and is compiled out of production builds.

## Project layout

```
src/
  app/
    Login.tsx                 login screen (rendered at /)
    auth/                     Sign-up, Forgot-password
    dashboard/                Shell (layout), Notifications
      overview/ income/ expenses/ budget/ history/ settings/ savings/
    globals.css               design tokens and component classes
  components/
    shell/                    desktop rail, mobile keypad bar, top bar, More sheet
    ringup/                   the entry sheet and its receipt
    dashboard/ charts/ ledger/ ui/
    motion/                   Drum (rolling figures), PrintIn, SegmentMeter
  lib/finance/
    firestore.ts              every Firestore read and write
    derive.ts                 calculations (existing ones first, new read-only views after)
    fixtures.ts, sampleRepo.ts  dev-only sample data
  store/                      useFinanceStore, useAuthStore, usePreferencesStore, useUiStore
  utils/                      formatMoney, error formatters, pagination
```

## Design system

The visual world is a register and its paper roll. Tokens live in `src/app/globals.css` and `tailwind.config.js`. In short:

- **Surfaces.** Counter-grey ground, white paper slips (`slip`, `slip-torn` with a torn edge), dark terminal chrome for navigation in both themes.
- **Type.** Chivo Mono for every figure, label and heading; Chivo for explanatory text.
- **Keys.** `key-enter` (primary, green), `key-plain`, `key-ghost`, `key-void` (destructive), `key-icon` (44 × 44). All ≥ 44 px tall.
- **Fields.** `field`, `field-label`, `AmountInput` (groups digits as you type).
- **Colour.** Tokens in `globals.css`, mapped in `tailwind.config.js`. Bucket inks (blue / magenta / ochre) and in/out chart colours were validated for colour-blind separation and contrast in both themes.
- **Dialogs.** Always `AccessibleDialog` (focus trap, Escape, focus return; `variant="responsive"` becomes a bottom sheet on phones).
- **Motion.** Figures roll to their value, slips print in line by line, meters print segment by segment, charts grow from the baseline. Every animation has a `prefers-reduced-motion` path (crossfades and instant values; confirmations are kept).

## Accessibility

WCAG 2.1 AA targets: one `h1` per page, skip link, labelled landmarks, ≥ 4.5:1 text contrast in both themes, 44 px touch targets, visible focus rings, dialogs and the notifications popover manage focus and close on Escape, live regions for form errors and confirmations, charts with keyboard-focusable marks and a table view, and a genuine reduced-motion mode.
