# 🥑 Hungry Kid — Food Diary

A personal food tracking app with **AI-powered macro estimation** from photos. Upload a photo of your meal, let Claude identify the food and estimate the macros, then adjust anything that looks off.

## Features

- 📸 **Photo upload** — drag & drop or click to upload one or more food photos
- 🤖 **AI macro estimation** — Claude vision API identifies food items and estimates calories, protein, carbs, fat, fiber, and sugar
- ✏️ **Editable entries** — adjust any macro or food name after the fact
- 📅 **Daily log** — browse your food history day by day
- 📊 **Daily summary** — calorie goal progress and macro breakdown bars
- 💾 **Local storage** — data lives in your browser, no account needed

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key

Copy the example env file and add your key:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to use

1. Tap **Log meal** in the top right
2. Upload one or more photos of your food
3. Tap **Analyze with AI** — Claude will identify the items and estimate macros
4. Review the estimates, adjust anything that's off, and add optional notes
5. Tap **Log this meal** to save it
6. Edit or delete any meal from the main log by tapping the pencil icon

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Anthropic SDK](https://docs.anthropic.com/) — Claude vision for food analysis
- [Lucide React](https://lucide.dev/) — icons
- `localStorage` for data persistence
