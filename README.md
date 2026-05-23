# Pennywise

A personal finance tracker built with Next.js and TypeScript.

## What it does

Pennywise helps users track their income, expenses, savings, and budgets in one place. Data is stored per-user in Firebase, and charts give a quick visual summary of where money is going.

## Features

- **Overview dashboard** — pie charts breaking down income and expenses by category, with totals
- **Expenses** — log and manage spending entries with categories and sub-categories
- **Income** — record income sources and amounts
- **Budget** — set spending limits across three buckets (Daily Needs, Planned Payments, Others) and track actual vs. budgeted spend
- **Notifications** — in-app notification centre
- **Settings** — currency preference and account settings
- **Authentication** — sign up, log in, and forgot-password via Firebase Auth

## Tech stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS
- Recharts for data visualisation
- Framer Motion for animations
- Firebase (Auth + Firestore)
- Zustand for client state (notifications, preferences)

## Getting started

```bash
npm install
npm run dev
```

Add your Firebase config to a `.env` file before running.
