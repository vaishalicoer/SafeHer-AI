# SafeHer AI — React Edition

A personal safety companion app built with **React + Vite** (plain JavaScript,
no TypeScript). This is the componentized version of the original single-file
HTML prototype — same features, same design, now organized as a real project
you can develop, extend, and deploy properly.

## Features

- Login / Register screen
- SOS button (hold 3s to trigger an alert)
- Direct-dial Police (100/112) and Women Helpline (1091) buttons
- Live location tracking (simulated map + optional real Google Maps)
- Fake Call with a full ringing → answered → live call screen
- Discreet audio recording (real microphone recording via `MediaRecorder`)
- Unsafe area reporting with categories, severity, and a community report feed
- Safe Route comparison (Fastest vs Safest)
- AI Risk Prediction meter
- Safety Timer with auto-alert on expiry
- Guardian Circle — emergency contacts with add/call/message
- Nearby Safe Locations with real turn-by-turn directions (Google Maps, no API key needed)
- AI Safety Assistant chat (calls the Anthropic API) + voice dictation
- Voice SOS (say "help me now" to trigger an alert hands-free)
- Admin Dashboard (KPIs, charts, incident table, live guardians)

## Project structure

```
safeher-ai-react/
├─ index.html              # Vite entry HTML
├─ package.json
├─ vite.config.js
├─ .env.example             # copy to .env and fill in your keys
└─ src/
   ├─ main.jsx              # React root
   ├─ App.jsx               # top-level state: auth, active tab, admin overlay
   ├─ styles/App.css        # all styling (design tokens, layout, components)
   ├─ context/
   │  ├─ AppContext.jsx     # toast + navigation + admin overlay
   │  └─ ChatContext.jsx    # AI assistant chat state
   ├─ utils/
   │  └─ claudeApi.js       # calls the Anthropic Messages API
   ├─ components/           # shared UI: Navbar, Composer, ProfileMenu, etc.
   └─ screens/              # Home, Journey, Report, Circle, Assistant
```

## Setup

1. **Install Node.js** (v18 or newer) if you don't have it: https://nodejs.org

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your API keys**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in:
   - `VITE_ANTHROPIC_API_KEY` — needed for the AI Safety Assistant chat to respond
   - `VITE_GOOGLE_MAPS_API_KEY` — optional, enables the real live map on the Journey screen

4. **Run it locally**
   ```bash
   npm run dev
   ```
   Open the URL it prints (usually `http://localhost:5173`).

5. **Build for production**
   ```bash
   npm run build
   npm run preview   # preview the production build locally
   ```

## Opening in VS Code

```bash
code .
```
(run this from inside the `safeher-ai-react` folder)

## Important security note

`src/utils/claudeApi.js` currently calls the Anthropic API **directly from the
browser** using `VITE_ANTHROPIC_API_KEY`. This is fine for local development,
but it exposes your API key to anyone who opens browser dev tools once
deployed. Before shipping this publicly:

- Move the API call into a small backend or serverless function (e.g. a
  Vercel/Netlify function, or an Express server) that holds the key
  server-side, and have the frontend call that endpoint instead.
- Do the same for any other secret keys before going to production.

## Browser feature notes

- **Microphone (recording, voice SOS, voice dictation)** requires `https://`
  or `http://localhost` — it will not work when opened as a plain `file://`
  page, and requires the user to grant microphone permission.
- **Geolocation (Nearby Safe Locations refresh)** requires the user to grant
  location permission.
- **Google Maps** only loads if you provide a valid `VITE_GOOGLE_MAPS_API_KEY`
  in `.env`; otherwise a simulated map view is shown.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: SafeHer AI React app"
git branch -M main
git remote add origin https://github.com/yourusername/safeher-ai.git
git push -u origin main
```

Your `.env` file is already excluded via `.gitignore`, so your API keys won't
be committed.
