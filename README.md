# AI Mining Operations Command Center

A full-stack real-time operations dashboard for mining systems.
Built with React (CDN, no build step) + FastAPI + WebSockets.

---

## Project Structure

```
mining-ops/
├── backend/
│   ├── main.py           # FastAPI server, WebSocket, simulation loop
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── index.html        # HTML shell, CDN scripts, Tailwind config
│   └── app.js            # All React components (JSX via Babel Standalone)
└── README.md
```

---

## Quick Start

### 1. Create a Python virtual environment

```bash
cd mining-ops
python -m venv venv
```

Activate it:
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

### 2. Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Run the server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open in browser

```
http://localhost:8000
```

The FastAPI backend serves the frontend statically — no separate frontend server needed.

---

## How It Works

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 (UMD CDN) | No build step — Babel Standalone transforms JSX in-browser |
| Styling | Tailwind CSS (Play CDN) | Dark theme, glassmorphism panels |
| Backend | FastAPI + Uvicorn | Async Python, serves static frontend |
| Real-time | WebSockets | Auto-reconnects on disconnect |
| Simulation | Python async loop | Fires random events every 8–15 seconds |

---

## Key Fix — Babel Preset

`index.html` uses `data-presets="react"` (NOT `"env,react"`).

The `env` preset tries to rewrite `import`/`export` syntax into CommonJS
`require()` calls — which don't exist in the browser UMD context.
The `react` preset only transforms JSX, which is all that's needed.

---

## Features

- 6 operational system panels: Abcotronics, Tontrac, Weighbridge Camera, Nimbus, SDE, Bidtrack
- Canvas-animated screen simulators per system (graphs, maps, terminal, camera feed, etc.)
- Live WebSocket alerts, AI analysis, and activity feed
- Background simulation loop generates realistic events automatically
- Operations Overview dashboard with status summary
- Stream source config modal (type + URL editable per system)
- Reconnect button per system feed
- Fullscreen toggle per system
- Clear logs button
- ONLINE / OFFLINE status indicators with auto-recovery simulation

---

## Extending

**Add a real camera feed:** Replace the canvas simulator in `ScreenMirror` with an `<img>` or `<video>` tag pointing at your RTSP/HLS stream URL.

**Add real AI analysis:** POST to `/api/systems/{id}/config` or extend the WebSocket handler in `main.py` to push AI-generated insights from an external model.

**Add a database:** Replace the in-memory `ALERTS`, `AI_ANALYSIS`, `ACTIVITY_FEED` lists in `main.py` with SQLite or PostgreSQL calls.
