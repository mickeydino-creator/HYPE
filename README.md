# HYPE

HYPE is a social feed where people discover trends and back them with a
virtual currency called HYPE. There is no real money, no withdrawals, and
no leaderboards — it's a purely social, purely virtual experience.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (dark, glassmorphic UI)
- React Router for navigation
- Recharts for price charts
- Client-side state persisted to `localStorage` (no backend — this is a
  self-contained prototype)

## Features

- **Home feed** — vertical scroll of trend cards (image, name, description,
  creator, price, % change, sparkline, Invest button).
- **Discover** — search, category filters, and a "Trending now" rail.
- **Create** — upload an image, name a trend, describe it, pick a category
  and starting HYPE price, then publish it to the feed.
- **Trend detail** — large cover, interactive price chart with time ranges,
  investor count, and Invest/Sell actions.
- **Portfolio** — net worth, cash balance, invested value, P/L, per-position
  breakdown, and a recent activity log.
- **Profile** — bio, balance, portfolio value, and the trends a user created
  (own profile and other users' profiles via `@creator` links).

## Virtual economy

Every user starts with 1,000 HYPE. Investing moves a small, bounded amount
of price impact in the trend's favor; selling moves it the other way. Prices
also drift slightly on their own over time to simulate organic market
activity. None of this has any connection to real currency.

## Running locally

```bash
npm install
npm run dev
```

Build for production with `npm run build`, preview with `npm run preview`.
