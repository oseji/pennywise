# Pennywise

A personal finance tracker built with Next.js and TypeScript.

## What it does

Pennywise helps you track income, expenses and budgets in one place. Data is stored per-user in Firebase, and the dashboard leads with the one number that matters — net balance — followed by ranked breakdowns of where the money came from and where it went.

## Features

- **Overview dashboard** — net balance (income − expenditure) and budget remaining up top, then ranked category breakdowns for income, expenditure and budget
- **Income** — record income sources and amounts, with a running total
- **Expenses** — log spending against budget categories and sub-categories
- **Budget** — set limits across three buckets (Daily Needs, Planned Payments, Others); each row shows spend against limit and says "Over by …" when a limit is blown
- **Notifications** — in-app activity feed for income and expense entries (can be switched off in Settings)
- **Settings** — light/dark theme, currency (NGN, USD, EUR), password reset, account deletion
- **Authentication** — sign up, log in and forgot-password via Firebase Auth; demo credentials are pre-filled on the login screen
- **Savings** — coming soon (the page exists as a placeholder)

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Firebase (Auth + Firestore)
- Zustand for client state (auth session, notifications, preferences)
- lucide-react icons, react-hot-toast

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

## Project layout

```
src/
  app/
    Login.tsx                 login screen (rendered at /)
    auth/                     Sign-up, Forgot-password
    dashboard/                layout, Sidebar, DashboardHeader, Notifications
      overview/               dashboard home + ChartCategories bar list
      income/ expenses/ budget/ settings/ savings/
    globals.css               design tokens and component classes
  components/                 AccessibleDialog, Logo, AuthShowcase, EmptyState, skeletons
  store/                      useAuthStore, usePreferencesStore, useNotificationStore
  utils/                      formatMoney, chartColors, Pagination, error formatters
```

## Design system notes

The UI is deliberately small. Reuse these before adding new styles:

- **Buttons** — `btn-primary`, `btn-outline-brand`, `btn-secondary` (ghost / cancel), `btn-danger`, `btn-outline-danger`. All are ≥ 44 px tall and `rounded-xl`.
- **Controls** — `formInput` for inputs/selects/textareas in the app, `authInput` on the auth screens, `iconBtn` for 44 × 44 icon-only buttons.
- **Surfaces** — `card` / `chartBox` (`rounded-2xl`), `dataTableHeader` + `dataTableSurface` for tables.
- **Dialogs** — always `AccessibleDialog` (focus trap, Escape, focus return; `variant="sheet"` for bottom sheets on mobile).
- **Colour** — brand greens in `tailwind.config.js`; muted text is `zinc-500` (light) / `zinc-400` (dark) — both clear WCAG AA. Chart colours come from the `--chart-1…10` custom properties in `globals.css`, which swap per theme.
- **Radius tiers** — controls `xl`, cards `2xl`, pills `full`.

## Accessibility

Audited against WCAG 2.1 AA: one `h1` per page with a proper heading outline, skip-to-content link, labelled landmarks, ≥ 4.5:1 text contrast in both themes, 44 px touch targets, visible `:focus-visible` rings, dialogs and the notifications popover manage focus and close on Escape, live regions for form errors.
