# Cryptosaurus: Hunt the Best Crypto Trades 🦖📈

Cryptosaurus is a high-performance cryptocurrency analytics and trading dashboard built for precision and speed. It features real-time market data, interactive financial charts, and a comprehensive portfolio management system with multi-currency support.

## 1. Tech Stack Used

### Frontend
- **Framework:** [Next.js v16.1.0](https://nextjs.org/)
- **Library:** [React v19.2.3](https://react.dev/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Styling:** [TailwindCSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Lightweight Charts v5.1.0](https://www.tradingview.com/lightweight-charts/)

### Data & APIs
- **Market Data:** [CoinGecko API](https://www.coingecko.com/en/api)
- **Live Price Ticks:** Binance WebSocket
- **Persistence:** LocalStorage (for Demo Trading & Auth)

### AI Assistance
- **Model:** Gemini (Advanced Agentic Coding Assistance)

---

## 2. Project Setup

- **Iconography:** Installed `lucide-react` for a consistent set of vector icons.
- **Git Workflow:** 
  - Setup SSH access to GitHub account.
  - Initialized repository and migrated to user-owned [Cryptosaurus](https://github.com/SparshGarg999/Cryptosaurus) repository.
  - Established `upstream` tracking for the base template.
- **UI System:** 
  - Initialized Shadcn-ui for modular component architecture.
  - Customized global CSS variable system to match professional exchange aesthetics (Binance Green/Red palette).

---

## 3. DevOps

### Local Development
- **Start Dev Server:** `npm run dev`
- **Port:** [http://localhost:3000](http://localhost:3000)
- **Environment:** Local development handles API calls via Next.js server actions and client-side fetches.

### Cloud Deployment
- **Web App:** [Vercel](https://vercel.com/)
- **Continuous Deployment:** Any commit pushed to the `main` branch triggers an automatic production deploy on Vercel.
- **Environment Variables:**
  - `COINGECKO_BASE_URL`
  - `COINGECKO_API_KEY`
  - `NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL`
  - `NEXT_PUBLIC_COINGECKO_API_KEY`

---

## 4. Key Features

- **Binance-Style Exchange UI:** A dense, 3-column trading layout with a central interactive chart, ticker tape header, and live orderbook/trade stream.
- **Global Multi-Currency Support:** Persistent currency selection (USD, INR, EUR, etc.) that scales all prices and historical data across the entire application.
- **Interactive Candlestick Charts:** High-density OHLC data visualization with multi-timeframe support (1m, 15m, 1h, 1D, etc.) using Binance and CoinGecko fallbacks.
- **Demo Trading & Portfolio P&L:** A fully functional mock trading system with live unrealized Profit & Loss calculations and a home page dashboard tracking total account value and buying power.
- **Universal Search (`Cmd+K`):** A global search modal that provides instant access to thousands of cryptocurrency pairs.

---

## 5. Project Tree

```bash
/
├── app/                  # Next.js App Router (Pages & Routes)
│   ├── coins/            # Dynamic token detail pages
│   ├── layout.tsx        # Root layout with CurrencyProvider
│   └── page.tsx          # Home page with Portfolio Dashboard
├── components/           # Reusable React components
│   ├── home/             # Home-specific components (PortfolioPnL, Trending)
│   ├── ui/               # Modular Shadcn UI components
│   ├── Header.tsx        # Global navigation & Search trigger
│   ├── SearchModal.tsx   # Global Cmd+K Search
│   ├── DemoTrading.tsx   # Mock trading & live P&L logic
│   └── CandlestickChart.tsx # Lightweight Charts integration
├── context/              # Context API providers
│   └── CurrencyContext.tsx # Global currency state management
├── lib/                  # Utility functions & API actions
│   ├── coingecko.actions.ts # Server-side API logic
│   └── utils.ts          # Tailwind merge & currency formatters
├── public/               # Static assets (logos, images)
├── constants.ts          # Global app constants (periods, coins)
├── type.d.ts             # Global TypeScript interface definitions
├── package.json          # Project dependencies & scripts
└── README.md             # Project documentation
```

---

## 6. Configurations

- **No hardcoded secrets:** All API keys and base URLs are managed via environment variables.
- **Currency Syncing:** The `useCurrency` hook ensures every component on every page reflects the user's chosen fiat currency without redundant API calls.
- **Responsive Layout:** The grid-based architecture ensures the professional exchange layout adapts to large monitors while remaining functional on smaller viewports.
