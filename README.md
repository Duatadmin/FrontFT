# Jarvis Chat PWA

A modern Progressive Web Application (PWA) built with React and Vite, featuring a responsive chat interface with modern UI/UX principles.

## 🚀 Features

- Progressive Web App (PWA) capabilities
- Modern React-based architecture
- Responsive design with Tailwind CSS
- Mobile-first approach
- Offline support
- Installable on desktop and mobile devices

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## 🛠 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd PWA1
```

2. Install dependencies:
```bash
npm install
```

## 🚀 Development

To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
PWA1/
├── src/               # Source code
├── public/            # Static assets
├── dist/             # Production build
├── index.html        # Entry HTML file
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── package.json      # Project dependencies and scripts
```

## 🛠 Tech Stack

- React
- Vite
- Tailwind CSS
- TypeScript
- PWA (vite-plugin-pwa)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📱 PWA Support

This application is installable as a Progressive Web App on both desktop and mobile devices. It supports:
- Offline functionality
- App-like experience
- Home screen installation
- Native-like features
# Jarvis Chat PWA

A modern Progressive Web Application (PWA) built with **React + Vite** that combines a conversational interface with a data-driven **Fitness Progress Dashboard**. The app follows mobile-first design, offers offline support, and can be installed on desktop and mobile devices.

---

## 🚀 Key Features

| Category | Description |
|----------|-------------|
| **Chat** | Real-time conversational UI styled after modern messengers (OpenAI Chat, WhatsApp). |
| **Dashboard** | At-a-glance view of weekly / monthly / all-time fitness metrics: **Volume**, **PRs**, **Streak**, interactive charts, and goal-oriented insights. |
| **PWA** | Offline caching, home-screen install prompt, splash screen, and full-screen mode. |
| **Responsive UI** | Built with Tailwind CSS, shadcn/ui components, and CSS Grid for adaptive layouts. |
| **State Management** | Global app state handled by **Zustand**; data fetching & caching with **SWR**. |
| **Type Safety** | Strict TypeScript everywhere (typed hooks, components, API clients). |
| **API Ready** | Seamless integration with the Jarvis backend (FastAPI) for chat and workout data. |
| **Voice Mode** | Enables TTS playback for bot messages. See [TTS Voice Mode Docs](./docs/TTS_VOICE_MODE.md). |

---

## 📋 Prerequisites

- **Node.js v18+**
- **npm** or **yarn**
- A running **Jarvis API** instance (or mocked endpoints) for dashboard data

---

## 🛠 Installation

```bash
git clone <repository-url>
cd PWA1
npm install          # or: yarn
📦 Project Structure
csharp
Копировать
Редактировать
PWA1/
├─ public/                 # Static assets & manifest
├─ src/
│  ├─ components/          # Reusable UI (ChatBubble, MetricCard, ...)
│  ├─ dashboard/           # Dashboard page, charts, hooks
│  ├─ chat/                # Chat input, message list, helpers
│  ├─ hooks/               # Custom hooks (useChat, useDashboardData)
│  ├─ lib/                 # API clients (swrFetcher, supabaseClient)
│  ├─ pages/               # Router entry points
│  ├─ store/               # Zustand slices
│  ├─ styles/              # Global styles / tailwind.css
│  └─ main.tsx            # App root (React 18 + React-Router)
├─ tests/                  # Vitest unit + integration tests
├─ tailwind.config.js      # Tailwind CSS setup
├─ vite.config.ts          # Vite + PWA plugin
└─ package.json
🗺️ Navigation

Route	Purpose
/	Chat home (default)
/dashboard	Fitness Progress Dashboard
/*	404 – Not Found
Routing is handled by react-router-dom v6 with lazy-loaded bundles and prefetch hints for the dashboard.

📊 Dashboard Overview
Metrics Grid

Metric	Example	Description
🏋️ Volume	8 450 kg	Sum of (weight × reps) in selected range
🔥 PRs	+2	New personal records hit
📆 Streak	4-day	Consecutive training days
Charts
Weekly Volume Trend (Recharts ⟩ AreaChart)

PR Timeline (BarChart)

Streak Heatmap (custom SVG grid)

All charts are animated with Framer Motion and respect dark-mode defaults.

Data Flow
useDashboardData(range) triggers SWR fetch ⇒ GET /api/progress?range=weekly

JSON response normalized → Zustand store

Components subscribe to slices; charts re-render on focus revalidation

🏗️ Development
bash
Копировать
Редактировать
npm run dev        # or: yarn dev
Dev server on http://localhost:5173

Hot-module reload (HMR) + Fast Refresh

🏁 Production
bash
Копировать
Редактировать
npm run build      # vite build
npm run preview    # local preview at 4173
The vite-plugin-pwa injects service-worker, precache manifest, and manifest.webmanifest.

## 🚂 How to Deploy to Railway

### Option A: Connect to GitHub Repository

1. Create a Railway account at [railway.app](https://railway.app)
2. From the Railway dashboard, click "New Project" and select "Deploy from GitHub repo"
3. Connect your GitHub account and select your repository
4. Railway will automatically detect the configuration and deploy your app
5. Set any required environment variables in the Railway dashboard

### Option B: Deploy with Railway CLI

1. Install the Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to your Railway account:
   ```bash
   railway login
   ```

3. Link your local project to a Railway project:
   ```bash
   railway link
   ```

4. Deploy your application:
   ```bash
   railway up
   ```

### Environment Variables

Make sure to set these environment variables in the Railway dashboard:

- `VITE_APP_ENV` - Set to "production"
- `VITE_APP_URL` - Your deployed app URL (provided by Railway)
- `VITE_SUPABASE_URL` - Your Supabase project URL (if using Supabase)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key (if using Supabase)

### Deployment Notes

- The app is configured to use Vite's preview server for production
- Alternatively, the included Dockerfile will build and serve using Nginx
- All routes are properly handled for the SPA with `/index.html` fallbacks
- Cache headers are configured for optimal performance

🧪 Testing

Layer	Tooling	Command
Unit	Vitest + React-Testing-Library	npm run test
E2E	Playwright (optional)	npm run test:e2e
Vitest runs in-band with JSDOM; Playwright scripts live under tests/e2e/.

🛠 Tech Stack
React 18

TypeScript 5

Vite 5 + vite-plugin-pwa

Tailwind CSS 3 + shadcn/ui

Zustand, SWR

Recharts (charts), Framer Motion (animations)

Vitest / Playwright for testing

🤝 Contributing
Fork the repo

git checkout -b feature/my-awesome-change

Commit & push

Open a Pull Request

Please follow the conventional-commits spec and run npm run lint before pushing.

📄 License
Proprietary software – All rights reserved.

📱 PWA Support Checklist
 Service-worker (offline shell, cache-first chat history)

 manifest.webmanifest with icons, name, theme color

 Add-to-Home-Screen prompt

 Splash screen + standalone display

 Background sync placeholder (future)

Built with ❤️ by the Isinka team