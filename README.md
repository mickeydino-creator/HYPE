# HYPE

HYPE is a social feed where people discover trends and back them with a
virtual currency called HYPE. There is no real money, no withdrawals, and
no leaderboards — it's a purely social, purely virtual experience.

This is a full-stack application: a React frontend backed by a real
Express + SQLite (Prisma) API. All accounts, balances, trends, holdings,
transactions and prices are persisted server-side and work across sessions
and devices — nothing important lives only in the browser.

## Stack

**Frontend** — React 19 + TypeScript + Vite, Tailwind CSS, React Router,
Recharts, Socket.IO client.

**Backend** (`server/`) — Express + TypeScript, Prisma ORM over SQLite,
JWT auth in an httpOnly cookie, bcrypt password hashing, Zod validation,
Multer for image uploads, Socket.IO for realtime price/feed updates.

## Architecture rule

The frontend never decides anything financial. It only asks the backend to
act, and the backend is the sole source of truth for:

- Whether a user can afford an investment
- Whether a user owns the units they're trying to sell
- Account balances and holdings
- Transaction records
- Market prices (a deterministic supply/demand model — buying pushes a
  trend's price up, selling pushes it down, bounded per order, price is
  always clamped above a floor)

Every invest/sell request re-validates the user, the trend, the balance and
the holding from the database inside a single atomic transaction, so
partial writes and race conditions can't happen. Nothing about pricing or
balances is ever trusted from the client.

## Data model

`User`, `Trend`, `Holding`, `Transaction`, `PriceHistory`, `Category` — see
`server/prisma/schema.prisma`. Portfolio values and profit/loss are
computed on the fly from current holdings and live prices, not stored.

## Running locally

First time setup:

```bash
npm install
npm run server:setup   # installs server deps, runs migrations, seeds demo data
```

Then, run both the frontend and backend together:

```bash
npm run dev:all
```

This starts the API on `http://localhost:8787` and the Vite dev server on
`http://localhost:5173` (which proxies `/api`, `/uploads` and `/socket.io`
to the API, so the app just works at `http://localhost:5173`).

You can also run them separately: `npm run dev` (frontend) and
`npm run dev:server` (backend, from `server/`).

### Demo accounts

The seed script creates an admin account and a few creator accounts:

- Admin: `admin` / `admin12345` (visible via Profile → Admin dashboard)
- Creators: `nova`, `jax.codes`, `mira`, `devon.k`, `ari` — all `password123`

Or just sign up for a new account — every new user gets a configurable
starting balance (1,000 HYPE by default, see `server/.env`).

## Environment variables (`server/.env`)

See `server/.env.example`. Key ones: `DATABASE_URL` (SQLite file),
`JWT_SECRET`, `CLIENT_ORIGIN` (CORS), `STARTING_BALANCE`.

## Building for production

```bash
npm run build            # frontend -> dist/
npm run build --prefix server   # backend -> server/dist/
```

Serve the built frontend behind any static host and run
`node --env-file=.env dist/index.js` from `server/` (after `npm run build`)
for the API, or point them both at your own hosting/reverse proxy setup.

## Features

- **Auth** — sign up, log in, log out, secure JWT session, unique usernames,
  profile picture, bio, join date.
- **Home feed** — vertical scroll of trend cards (image, name, description,
  creator, live price, % change, sparkline, Invest button) backed by real
  data and updated live via WebSocket.
- **Discover** — search, category filters, and a "Trending now" rail.
- **Create** — upload an image, name a trend, describe it, pick a category
  and starting HYPE price; stored server-side with its own price history.
- **Trend detail** — interactive price chart with time ranges, live price
  updates, investor count, and Invest/Sell actions.
- **Sell flow** — shows what you own, lets you type exact units or use
  ¼ / ½ / ¾ / Sell All quick buttons; the backend verifies ownership before
  executing.
- **Portfolio** — balance, net worth, invested value, per-position P/L,
  overall P/L, and a real transaction history — all computed server-side.
- **Profile** — bio, avatar, balance (private), portfolio value, and the
  trends a user created; editable for your own profile.
- **Admin dashboard** (admin accounts only) — platform stats, suspend/
  unsuspend users, remove trends, browse all transactions.

## Virtual economy

Every user starts with a configurable amount of HYPE (1,000 by default).
Investing/selling moves a trend's price by a small, bounded amount based on
order size (supply/demand), and prices also drift slightly on their own to
simulate an organic market. None of this has any connection to real
currency, real markets, or real financial products.
