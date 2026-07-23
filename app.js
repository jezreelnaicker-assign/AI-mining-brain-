// ============================================================
// AI OPERATIONS COMMAND CENTER — app.js
// React 18, Tailwind CSS, Canvas-based screen simulators
// No import/export — React & ReactDOM loaded as UMD globals
// ============================================================

// ─── INLINE SVG ICON LIBRARY ────────────────────────────────
const Icons = {
  Overview: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  Camera: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Terminal: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Database: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  Map: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  Trending: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Cpu: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  Alert: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
    </svg>
  ),
  Fullscreen: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Connected: () => (
    <span className="relative flex h-2 w-2 mr-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
  ),
  Disconnected: () => (
    <span className="relative flex h-2 w-2 mr-2">
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
  )
};

const getSystemIcon = (id) => {
  switch (id) {
    case 'abcotronics': return <Icons.Database />;
    case 'tontrac': return <Icons.Map />;
    case 'weighbridge_camera': return <Icons.Camera />;
    case 'nimbus': return <Icons.Cpu />;
    case 'sde': return <Icons.Terminal />;
    case 'bidtrack': return <Icons.Trending />;
    default: return <Icons.Database />;
  }
};

// ─── ROOT APP ───────────────────────────────────────────────
const App = () => {
  const [selectedSystem, setSelectedSystem] = React.useState('overview');
  const [activeTab, setActiveTab] = React.useState('alerts');
  const [systems, setSystems] = React.useState({});
  const [alerts, setAlerts] = React.useState([]);
  const [aiAnalysis, setAiAnalysis] = React.useState([]);
  const [activityFeed, setActivityFeed] = React.useState([]);
  const [wsConnected, setWsConnected] = React.useState(false);
  const [configModalSystem, setConfigModalSystem] = React.useState(null);

  React.useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'INITIAL_STATE') {
          setSystems(msg.systems);
          setAlerts(msg.alerts.reverse());
          setAiAnalysis(msg.ai_analysis.reverse());
          setActivityFeed(msg.activity_feed.reverse());
        } else if (msg.type === 'SYSTEM_UPDATE') {
          setSystems(prev => ({ ...prev, [msg.system.id]: msg.system }));
        } else if (msg.type === 'NEW_ALERT') {
          setAlerts(prev => [msg.data, ...prev]);
        } else if (msg.type === 'NEW_AI_ANALYSIS') {
          setAiAnalysis(prev => [msg.data, ...prev]);
        } else if (msg.type === 'NEW_ACTIVITY') {
          setActivityFeed(prev => [msg.data, ...prev]);
        } else if (msg.type === 'CLEAR_LOGS') {
          setAlerts([]);
          setAiAnalysis([]);
          setActivityFeed([]);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Retrying in 3s...");
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connectWS();
    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleReconnect = async (systemId) => {
    try {
      await fetch(`/api/systems/${systemId}/reconnect`, { method: 'POST' });
    } catch (err) {
      console.error("Error reconnecting stream:", err);
    }
  };

  const handleUpdateConfig = async (systemId, streamType, streamUrl) => {
    try {
      const response = await fetch(`/api/systems/${systemId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_type: streamType, stream_url: streamUrl })
      });
      if (response.ok) setConfigModalSystem(null);
    } catch (err) {
      console.error("Error updating config:", err);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/clear', { method: 'POST' });
    } catch (err) {
      console.error("Error clearing logs:", err);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-950 font-sans overflow-hidden">
      <Sidebar
        systems={systems}
        selectedSystem={selectedSystem}
        setSelectedSystem={setSelectedSystem}
        wsConnected={wsConnected}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-14 border-b border-slate-900 bg-slate-950/80 backdrop-blur flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 bg-cyan-500 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse"></div>
            <h1 className="text-lg font-semibold tracking-wider font-display text-slate-100 uppercase">
              AI Operations Command Center
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-xs text-slate-400 bg-slate-900/60 py-1 px-3 rounded-full border border-slate-800">
              {wsConnected ? <Icons.Connected /> : <Icons.Disconnected />}
              <span className="font-mono tracking-wide">{wsConnected ? "STREAM STABLE" : "DISCONNECTED"}</span>
            </div>
            <button
              onClick={handleClearLogs}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
            >
              Clear Logs
            </button>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col p-4 bg-[#070d16] border-r border-slate-900 overflow-y-auto">
            {selectedSystem === 'overview' ? (
              <OverviewDashboard
                systems={systems}
                alerts={alerts}
                aiAnalysis={aiAnalysis}
                setSelectedSystem={setSelectedSystem}
              />
            ) : (
              <ScreenMirror
                system={systems[selectedSystem]}
                alerts={alerts.filter(a => a.system_id === selectedSystem)}
                onReconnect={() => handleReconnect(selectedSystem)}
                onConfigClick={() => setConfigModalSystem(systems[selectedSystem])}
              />
            )}
          </div>

          <RightPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            alerts={alerts}
            aiAnalysis={aiAnalysis}
            activityFeed={activityFeed}
            selectedSystem={selectedSystem}
          />
        </div>
      </div>

      {configModalSystem && (
        <ConfigModal
          system={configModalSystem}
          onClose={() => setConfigModalSystem(null)}
          onSave={(type, url) => handleUpdateConfig(configModalSystem.id, type, url)}
        />
      )}
    </div>
  );
};

// ─── SIDEBAR ────────────────────────────────────────────────
const Sidebar = ({ systems, selectedSystem, setSelectedSystem, wsConnected }) => {
  const systemKeys = ['abcotronics', 'tontrac', 'weighbridge_camera', 'nimbus', 'sde', 'bidtrack'];

  return (
    <div className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-slate-900 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center font-display text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            Ω
          </div>
          <div>
            <h2 className="font-semibold text-slate-200 text-sm tracking-wide">MINERALS OPS</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Autonomous Core</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        <button
          onClick={() => setSelectedSystem('overview')}
          className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition duration-150 ${
            selectedSystem === 'overview'
              ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
          }`}
        >
          <span className={`mr-3 ${selectedSystem === 'overview' ? 'text-cyan-400' : 'text-slate-500'}`}>
            <Icons.Overview />
          </span>
          <span className="font-display uppercase tracking-wider text-xs">Operations Overview</span>
        </button>

        <div className="h-px bg-slate-900 my-4"></div>
        <div className="px-3 mb-2">
          <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Operational Units</p>
        </div>

        {systemKeys.map((key) => {
          const sys = systems[key];
          if (!sys) return null;
          const isSelected = selectedSystem === key;
          const isOnline = sys.status === 'online';
          return (
            <button
              key={key}
              onClick={() => setSelectedSystem(key)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition duration-150 ${
                isSelected
                  ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-bold'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {getSystemIcon(key)}
                </span>
                <span className="font-display uppercase tracking-wider text-xs">{sys.name}</span>
              </div>
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'}`}></span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-900 text-[10px] font-mono text-slate-600 bg-slate-950/40 shrink-0">
        <div>CORE OS: v4.81.2-ALPHA</div>
        <div>SYS CLK: {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
};

// ─── SCREEN MIRROR (CANVAS SIMULATOR) ───────────────────────
const ScreenMirror = ({ system, alerts, onReconnect, onConfigClick }) => {
  const canvasRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  if (!system) {
    return <div className="text-slate-400 font-mono">Loading system stream...</div>;
  }

  const isOnline = system.status === 'online';
  const hasCriticalWarning = alerts.some(a => ['critical', 'error', 'warning'].includes(a.severity));

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let frame = 0;

    // Shared simulation state
    const pathPoints = [
      { x: 100, y: 150 }, { x: 220, y: 150 }, { x: 320, y: 250 },
      { x: 480, y: 250 }, { x: 580, y: 100 }, { x: 700, y: 100 }
    ];
    let trucks = [
      { id: "TRK-01", progress: 0.1, speed: 0.0012 },
      { id: "TRK-02", progress: 0.45, speed: 0.0009 },
      { id: "TRK-03", progress: 0.8, speed: 0.0016 }
    ];
    let wbTruckX = -100;
    let wbWeight = 0;
    let wbState = 'entering';
    let abcPoints = Array.from({ length: 40 }, () => 85);
    let bidPrices = Array.from({ length: 30 }, (_, i) => 12000 + i * 50 + Math.random() * 200);

    const resizeCanvas = () => {
      const rect = canvas.parentNode.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawGrid = (w, h) => {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    };

    const drawStaticNoise = (w, h) => {
      const imgData = ctx.createImageData(w, h);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val; data[i + 1] = val; data[i + 2] = val; data[i + 3] = 40;
      }
      ctx.putImageData(imgData, 0, 0);
    };

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060a0f';
      ctx.fillRect(0, 0, w, h);
      drawGrid(w, h);

      if (!isOnline) {
        drawStaticNoise(w, h);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(0, h / 2 - 50, w, 100);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h / 2 - 50); ctx.lineTo(w, h / 2 - 50);
        ctx.moveTo(0, h / 2 + 50); ctx.lineTo(w, h / 2 + 50);
        ctx.stroke();
        ctx.fillStyle = '#f87171';
        ctx.font = '700 24px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText("CRITICAL FEED DISRUPTION: NO SIGNAL", w / 2, h / 2 - 5);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 14px Outfit';
        ctx.fillText("OPERATIONAL FEED DISCONNECTED — CHECK PHYSICAL NODE OR REMOTE ROUTER", w / 2, h / 2 + 25);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = frame % 8; i < h; i += 8) ctx.fillRect(0, i, w, 2);
        animationId = requestAnimationFrame(render);
        return;
      }

      // ── ABCOTRONICS ──────────────────────────────────────
      if (system.id === 'abcotronics') {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
        ctx.fillRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#06b6d4';
        ctx.font = '700 18px Rajdhani';
        ctx.textAlign = 'left';
        ctx.fillText("ABCOTRONICS PLC TELEMETRY // CORE PROCESS MONITOR", 40, 50);

        if (frame % 5 === 0) {
          abcPoints.push(system.metrics.efficiency + (Math.random() * 4 - 2));
          abcPoints.shift();
        }
        const graphW = w - 100, graphH = h - 220, startX = 50, startY = h - 80;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY - (abcPoints[0] - 50) * (graphH / 50));
        for (let i = 1; i < abcPoints.length; i++) {
          ctx.lineTo(startX + (i * (graphW / (abcPoints.length - 1))), startY - (abcPoints[i] - 50) * (graphH / 50));
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
        ctx.lineTo(startX + graphW, startY);
        ctx.lineTo(startX, startY);
        ctx.closePath();
        ctx.fill();

        // Oscilloscope
        const oscX = w - 250, oscY = 80, oscW = 200, oscH = 60;
        ctx.fillStyle = 'rgba(6, 10, 15, 0.8)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.fillRect(oscX, oscY, oscW, oscH);
        ctx.strokeRect(oscX, oscY, oscW, oscH);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.moveTo(oscX, oscY + oscH / 2);
        for (let j = 0; j < oscW; j++) {
          const amp = hasCriticalWarning ? 25 : 12;
          const freq = hasCriticalWarning ? 0.08 : 0.04;
          ctx.lineTo(oscX + j, oscY + oscH / 2 + Math.sin((j + frame) * freq) * amp + Math.cos((j * 0.5 + frame) * freq * 1.5) * (amp / 3));
        }
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = '500 10px Fira Code';
        ctx.fillText("SIGNAL FEED A-10", oscX + 10, oscY + 18);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px Rajdhani';
        ctx.fillText(`THROUGHPUT: ${system.metrics.throughput} T/H`, 50, h - 45);
        ctx.fillText(`EFFICIENCY: ${system.metrics.efficiency}%`, 220, h - 45);
        ctx.fillStyle = system.metrics.temp > 55 ? '#f87171' : '#34d399';
        ctx.fillText(`SYS TEMP: ${system.metrics.temp} °C`, 390, h - 45);

      // ── TONTRAC ──────────────────────────────────────────
      } else if (system.id === 'tontrac') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
        ctx.fillRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#10b981';
        ctx.font = '700 18px Rajdhani';
        ctx.textAlign = 'left';
        ctx.fillText("TONTRAC HAULAGE & DISPATCH SYSTEM // LIVE ROAD NETWORK", 40, 50);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        ctx.stroke();
        ctx.setLineDash([]);

        trucks.forEach(truck => {
          truck.progress += truck.speed;
          if (truck.progress > 1) { truck.progress = 0; truck.speed = 0.0008 + Math.random() * 0.001; }
          const segIdx = Math.floor(truck.progress * (pathPoints.length - 1));
          if (segIdx < pathPoints.length - 1) {
            const seg = (truck.progress * (pathPoints.length - 1)) - segIdx;
            const p1 = pathPoints[segIdx], p2 = pathPoints[segIdx + 1];
            const x = p1.x + (p2.x - p1.x) * seg;
            const y = p1.y + (p2.y - p1.y) * seg;
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f1f5f9';
            ctx.font = '600 10px Fira Code';
            ctx.fillText(truck.id, x + 12, y + 4);
          }
        });

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.lineWidth = 1;
        ctx.fillRect(w - 240, h - 180, 200, 140);
        ctx.strokeRect(w - 240, h - 180, 200, 140);
        ctx.fillStyle = '#10b981';
        ctx.font = '600 13px Rajdhani';
        ctx.fillText("TONTRAC DATA VITAL", w - 225, h - 155);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 12px Outfit';
        ctx.fillText(`Active Deliveries: ${system.metrics.active_jobs}`, w - 225, h - 130);
        ctx.fillText(`Total Dispatches: ${system.metrics.dispatched}`, w - 225, h - 110);
        ctx.fillText(`Route Delay Alert: ${system.metrics.delayed}`, w - 225, h - 90);

      // ── WEIGHBRIDGE CAMERA ────────────────────────────────
      } else if (system.id === 'weighbridge_camera') {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.03)';
        ctx.fillRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#22d3ee';
        ctx.font = '700 18px Rajdhani';
        ctx.textAlign = 'left';
        ctx.fillText("WEIGHBRIDGE LPR CORE // CAM-02 INTEGRATION", 40, 50);

        ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.lineWidth = 1;
        const bSize = 30;
        [[40, 90, 1, 1], [w - 40, 90, -1, 1], [40, h - 90, 1, -1], [w - 40, h - 90, -1, -1]].forEach(([x, y, dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x + bSize * dx, y);
          ctx.moveTo(x, y); ctx.lineTo(x, y + bSize * dy);
          ctx.stroke();
        });

        const scaleX = w / 2 - 150, scaleY = h / 2 + 20, scaleW = 300, scaleH = 20;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(scaleX, scaleY, scaleW, scaleH);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.strokeRect(scaleX, scaleY, scaleW, scaleH);

        if (wbState === 'entering') {
          wbTruckX += 3;
          if (wbTruckX >= w / 2 - 80) { wbState = 'weighing'; frame = 0; }
        } else if (wbState === 'weighing') {
          wbWeight = Math.min(28.45, wbWeight + 1.25);
          if (frame > 90) wbState = 'exiting';
        } else if (wbState === 'exiting') {
          wbTruckX += 4;
          wbWeight = Math.max(0, wbWeight - 2.5);
          if (wbTruckX > w + 100) { wbTruckX = -150; wbState = 'entering'; wbWeight = 0; }
        }

        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.fillRect(wbTruckX, scaleY - 60, 160, 58);
        ctx.strokeRect(wbTruckX, scaleY - 60, 160, 58);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        [30, 50, 110, 130].forEach(ox => { ctx.arc(wbTruckX + ox, scaleY, 10, 0, Math.PI * 2); });
        ctx.fill();

        if (wbState === 'weighing') {
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(wbTruckX + 135, scaleY - 25, 20, 12);
          ctx.fillStyle = 'rgba(225, 29, 72, 0.2)';
          ctx.fillRect(wbTruckX + 135, scaleY - 25, 20, 12);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 1;
          ctx.fillRect(w / 2 - 120, h / 2 - 120, 240, 50);
          ctx.strokeRect(w / 2 - 120, h / 2 - 120, 240, 50);
          ctx.fillStyle = '#f43f5e';
          ctx.font = '600 12px Fira Code';
          ctx.textAlign = 'center';
          ctx.fillText(`OCR HIT: [${system.metrics.last_ocr}]`, w / 2, h / 2 - 102);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '500 10px Fira Code';
          ctx.fillText("LPR MATCH CONFIDENCE: 98.4%", w / 2, h / 2 - 84);
        }

        ctx.fillStyle = '#090d16';
        ctx.fillRect(w / 2 - 100, scaleY + 30, 200, 45);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
        ctx.strokeRect(w / 2 - 100, scaleY + 30, 200, 45);
        ctx.fillStyle = '#22d3ee';
        ctx.font = '700 20px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(`${wbWeight.toFixed(2)} TONNES`, w / 2, scaleY + 60);

      // ── NIMBUS ───────────────────────────────────────────
      } else if (system.id === 'nimbus') {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.03)';
        ctx.fillRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#a855f7';
        ctx.font = '700 18px Rajdhani';
        ctx.textAlign = 'left';
        ctx.fillText("NIMBUS CLOUD CONTAINER CLUSTER HUB", 40, 50);

        const nodeY = 100, nodeW = (w - 120) / 3, nodeH = h - 220;
        for (let i = 0; i < 3; i++) {
          const nodeX = 40 + i * (nodeW + 20);
          const load = i === 1 ? system.metrics.cpu_load : (40 + Math.sin(frame * 0.05 + i) * 8);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.strokeStyle = i === 1 && load > 80 ? '#ef4444' : '#a855f7';
          ctx.lineWidth = 1.5;
          ctx.fillRect(nodeX, nodeY, nodeW, nodeH);
          ctx.strokeRect(nodeX, nodeY, nodeW, nodeH);
          for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
              ctx.fillStyle = Math.random() < 0.1
                ? (i === 1 && load > 80 ? '#f87171' : '#facc15')
                : '#10b981';
              ctx.beginPath();
              ctx.arc(nodeX + 25 + col * 15, nodeY + 30 + row * 25, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.fillStyle = load > 80 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(168, 85, 247, 0.15)';
          ctx.fillRect(nodeX + 15, nodeY + 160, nodeW - 30, nodeH - 180);
          ctx.fillStyle = load > 80 ? '#ef4444' : '#a855f7';
          ctx.font = '600 13px Rajdhani';
          ctx.fillText(`NODE 0${i + 1} LOAD: ${load.toFixed(1)}%`, nodeX + 20, nodeY + 195);
        }
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 13px Rajdhani';
        ctx.fillText(`CLUSTER HEALTH: 100%`, 40, h - 50);
        ctx.fillText(`NETWORK LATENCY: ${system.metrics.latency_ms} ms`, 240, h - 50);
        ctx.fillText(`MEM UTILITIES: ${system.metrics.memory_usage}%`, 440, h - 50);

      // ── SDE ──────────────────────────────────────────────
      } else if (system.id === 'sde') {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.02)';
        ctx.fillRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#64748b';
        ctx.font = '700 18px Rajdhani';
        ctx.textAlign = 'left';
        ctx.fillText("SDE DEPLOYMENT PIPELINE // COMPILE & BUILD CONSOLE", 40, 50);

        ctx.fillStyle = '#020617';
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.fillRect(40, 70, w - 80, h - 160);
        ctx.strokeRect(40, 70, w - 80, h - 160);

        const commands = [
          "$ git checkout main",
          "Already on 'main' - Your branch is up to date.",
          "$ npm run build",
          "> sde-pipeline@4.2.1 build",
          "> tsc && vite build",
          "vite v5.0.12 building for production...",
          "✓ 412 modules transformed.",
          "rendering chunks...",
          "dist/index.html                     0.85 kB │ gzip:  0.42 kB",
          "dist/assets/index-D7b39f1c.css    142.40 kB │ gzip: 18.12 kB",
          "dist/assets/index-A415be77.js     920.12 kB │ gzip: 242.08 kB",
          "✓ built in 4.85s",
          "$ docker build -t mining-ops-mesh:latest .",
          "Sending build context to Docker daemon  24.51MB",
          "Step 1/8 : FROM python:3.11-alpine",
          " ---> 429f45672b11",
          "Step 2/8 : WORKDIR /app",
          " ---> Using cache",
          "Step 3/8 : COPY requirements.txt .",
          " ---> Using cache",
          "Step 4/8 : RUN pip install -r requirements.txt",
          " ---> Running in abc91849df",
          "Successfully installed uvicorn websockets fastapi"
        ];
        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px Fira Code';
        const lineIdx = Math.floor(frame / 6) % commands.length;
        for (let l = 0; l < 14; l++) {
          const idx = (lineIdx - 14 + l + commands.length) % commands.length;
          ctx.fillText(commands[idx], 60, 110 + l * 20);
        }
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(40, h - 80, w - 80, 20);
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 11px Rajdhani';
        ctx.fillText(`STATUS: ACTIVE DEV CYCLES // ERROR COUNTER: ${system.metrics.errors_logged} DEPLOY FAILS`, 55, h - 66);

      // ── BIDTRACK ─────────────────────────────────────────
      } else if (system.id === 'bidtrack') {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.03)';
        ctx.fillRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#eab308';
        ctx.font = '700 18px Rajdhani';
        ctx.textAlign = 'left';
        ctx.fillText("BIDTRACK REAL-TIME COMMODITIES MARKET LOG", 40, 50);

        if (frame % 15 === 0) {
          bidPrices.push(system.metrics.avg_bid_value + (Math.random() * 200 - 100));
          bidPrices.shift();
        }
        const bW = w - 100, bH = h - 220, bStartX = 50, bStartY = h - 80;
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bStartX, bStartY - (bidPrices[0] - 11000) * (bH / 3000));
        for (let i = 1; i < bidPrices.length; i++) {
          ctx.lineTo(bStartX + (i * (bW / (bidPrices.length - 1))), bStartY - (bidPrices[i] - 11000) * (bH / 3000));
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
        ctx.lineWidth = 1;
        ctx.fillRect(w - 300, 70, 250, 110);
        ctx.strokeRect(w - 300, 70, 250, 110);
        ctx.fillStyle = '#eab308';
        ctx.font = '600 13px Rajdhani';
        ctx.fillText("LATEST TRADE DEALS", w - 285, 95);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '500 11px Outfit';
        ctx.fillText(`Pending Deals: ${system.metrics.pending_deals}`, w - 285, 120);
        ctx.fillText(`Average Bid Value: $${system.metrics.avg_bid_value}`, w - 285, 140);
        ctx.fillText(`Current Deals Active: ${system.metrics.current_bids}`, w - 285, 160);
      }

      // Shared overlays
      if (hasCriticalWarning) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(frame * 0.1) * 0.3})`;
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, w, h);
        ctx.fillStyle = '#ef4444';
        ctx.font = '700 12px Fira Code';
        ctx.textAlign = 'right';
        ctx.fillText("WARNING // AI DETECTION ENGAGED", w - 40, 50);
      }
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '500 10px Fira Code';
      ctx.textAlign = 'right';
      ctx.fillText(`FPS: 60 // LATENCY: 22ms // STREAM: H.264`, w - 40, h - 35);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [system, isOnline, hasCriticalWarning]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen && containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen && document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-slate-950 rounded-lg overflow-hidden border border-slate-900 shadow-2xl relative">
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-900 flex justify-between items-center shrink-0 z-10">
        <div>
          <div className="text-xs font-mono text-slate-500 flex items-center">
            <span>{system.stream_type}</span>
            <span className="mx-2">•</span>
            <span className="truncate max-w-[200px]" title={system.stream_url}>{system.stream_url}</span>
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-display">{system.name} Stream Mirror</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onReconnect} className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">
            <Icons.Refresh /><span>Reconnect</span>
          </button>
          <button onClick={onConfigClick} className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">
            <Icons.Settings /><span>Source</span>
          </button>
          <button onClick={toggleFullscreen} className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">
            <Icons.Fullscreen />
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-[#020508] scanlines">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>
    </div>
  );
};

// ─── OVERVIEW DASHBOARD ──────────────────────────────────────
const OverviewDashboard = ({ systems, alerts, aiAnalysis, setSelectedSystem }) => {
  const keys = Object.keys(systems);
  const activeAlerts = alerts.filter(a => ['critical', 'error', 'warning'].includes(a.severity));

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-lg border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-cyan-950 text-cyan-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">SYS INTEGRITY</div>
            <div className="text-xl font-bold font-display text-slate-200">100% SECURE</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg border border-slate-800 flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${activeAlerts.length > 0 ? 'bg-red-950 text-red-400 animate-pulse-slow' : 'bg-slate-900 text-slate-400'}`}>
            <Icons.Alert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">ACTIVE ALERTS</div>
            <div className={`text-xl font-bold font-display ${activeAlerts.length > 0 ? 'text-red-400' : 'text-slate-200'}`}>
              {activeAlerts.length} TRIGGERED
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-950 text-purple-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">AI RECENT OBS</div>
            <div className="text-xl font-bold font-display text-slate-200">{aiAnalysis.length} INSIGHTS</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">ONLINE FEEDS</div>
            <div className="text-xl font-bold font-display text-slate-200">
              {keys.filter(k => systems[k]?.status === 'online').length} / {keys.length} ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Systems grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase">System Status Diagnostics</h3>
          <span className="h-px bg-slate-900 flex-1 mx-4"></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {keys.map((key) => {
            const sys = systems[key];
            if (!sys) return null;
            const isOnline = sys.status === 'online';
            const sysAlertsCount = alerts.filter(a => a.system_id === key && a.severity !== 'info').length;
            return (
              <div
                key={key}
                onClick={() => setSelectedSystem(key)}
                className={`glass-panel p-5 rounded-lg border transition duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl ${
                  isOnline ? 'border-slate-900 hover:border-slate-800' : 'border-red-950 bg-red-950/5 hover:border-red-900'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className={isOnline ? 'text-cyan-400' : 'text-red-400'}>{getSystemIcon(key)}</span>
                    <h4 className="font-semibold text-slate-200 text-sm tracking-wide uppercase font-display">{sys.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wide ${
                    isOnline ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' : 'bg-red-950/60 text-red-400 border border-red-900/40'
                  }`}>
                    {isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 border-t border-slate-900/60 pt-3">
                    {Object.entries(sys.metrics || {}).slice(0, 2).map(([k, val]) => (
                      <div key={k}>
                        <div className="uppercase text-[9px] tracking-wider text-slate-600">{k.replace(/_/g, ' ')}</div>
                        <div className="text-slate-300 font-semibold">{val}</div>
                      </div>
                    ))}
                  </div>
                  {sysAlertsCount > 0 ? (
                    <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-950/20 py-1.5 px-2.5 rounded border border-amber-950/50">
                      <Icons.Alert className="w-3.5 h-3.5" />
                      <span className="font-semibold tracking-wide">{sysAlertsCount} active warnings</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-600 font-mono">✓ No anomalies flagged</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI insights strip */}
      <div className="glass-panel p-5 rounded-lg border border-slate-900">
        <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-4">Latest Active AI Vision Observations</h4>
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
          {aiAnalysis.length > 0 ? (
            aiAnalysis.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-start text-xs border-b border-slate-900/60 pb-2.5 last:border-none last:pb-0">
                <div>
                  <span className="font-bold text-cyan-400 uppercase tracking-wide mr-2">[{item.system_name}]</span>
                  <span className="text-slate-300">{item.insight}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono ml-4">{item.timestamp}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 font-mono py-2">Waiting for AI stream telemetry observations...</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── RIGHT PANEL ─────────────────────────────────────────────
const RightPanel = ({ activeTab, setActiveTab, alerts, aiAnalysis, activityFeed, selectedSystem }) => {
  const filteredAlerts = selectedSystem === 'overview' ? alerts : alerts.filter(a => a.system_id === selectedSystem);
  const filteredAnalysis = selectedSystem === 'overview' ? aiAnalysis : aiAnalysis.filter(a => a.system_id === selectedSystem);
  const filteredActivity = selectedSystem === 'overview' ? activityFeed : activityFeed.filter(a => a.system_id === selectedSystem);

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-950/40 border-red-900/40 text-red-400';
      case 'error': return 'bg-red-950/20 border-red-950/40 text-red-300';
      case 'warning': return 'bg-amber-950/20 border-amber-900/40 text-amber-400';
      case 'info': return 'bg-cyan-950/20 border-cyan-950/40 text-cyan-400';
      default: return 'bg-slate-900/60 border-slate-800 text-slate-300';
    }
  };

  const tabClass = (tab) =>
    `py-3.5 text-xs font-semibold tracking-wide border-b-2 transition font-display uppercase ${
      activeTab === tab
        ? 'border-cyan-500 text-cyan-400 bg-slate-900/20'
        : 'border-transparent text-slate-400 hover:text-slate-200'
    }`;

  return (
    <div className="w-80 border-l border-slate-900 bg-slate-950 flex flex-col h-full shrink-0">
      <div className="grid grid-cols-3 border-b border-slate-900 shrink-0">
        <button onClick={() => setActiveTab('alerts')} className={tabClass('alerts')}>
          Alerts {filteredAlerts.length > 0 && `(${filteredAlerts.length})`}
        </button>
        <button onClick={() => setActiveTab('analysis')} className={tabClass('analysis')}>AI Analysis</button>
        <button onClick={() => setActiveTab('activity')} className={tabClass('activity')}>Activity</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'alerts' && (
          filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
            <div key={alert.id} className={`p-3 rounded border text-xs leading-relaxed transition ${getSeverityStyles(alert.severity)}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold font-display uppercase tracking-wider">{alert.system_name}</span>
                <span className="font-mono text-[9px] opacity-60">{alert.timestamp}</span>
              </div>
              <p>{alert.message}</p>
            </div>
          )) : (
            <div className="text-xs text-slate-500 font-mono py-8 text-center">No active warnings detected</div>
          )
        )}

        {activeTab === 'analysis' && (
          filteredAnalysis.length > 0 ? filteredAnalysis.map((item) => (
            <div key={item.id} className="p-3 bg-slate-900/40 rounded border border-slate-900/80 text-xs leading-relaxed">
              <div className="flex justify-between items-center mb-2">
                <span className="px-2 py-0.5 bg-purple-950/60 text-purple-400 border border-purple-900/30 rounded text-[9px] font-mono font-semibold uppercase tracking-wider">
                  {item.category.replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-[9px] text-slate-500">{item.timestamp}</span>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider font-semibold mb-1 text-slate-500">[{item.system_name}]</div>
              <p className="text-slate-200">{item.insight}</p>
            </div>
          )) : (
            <div className="text-xs text-slate-500 font-mono py-8 text-center">Waiting for AI stream evaluation logs...</div>
          )
        )}

        {activeTab === 'activity' && (
          <div className="relative border-l border-slate-900 pl-4 space-y-4 py-2 ml-1">
            {filteredActivity.length > 0 ? filteredActivity.map((act) => (
              <div key={act.id} className="relative text-xs">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-slate-950"></div>
                <div className="text-slate-500 font-mono text-[9px] mb-0.5">{act.timestamp} • {act.system_name}</div>
                <p className="text-slate-300 leading-normal">{act.message}</p>
              </div>
            )) : (
              <div className="text-xs text-slate-500 font-mono py-8">No telemetry activity logs yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CONFIG MODAL ─────────────────────────────────────────────
const ConfigModal = ({ system, onClose, onSave }) => {
  const [streamType, setStreamType] = React.useState(system.stream_type);
  const [streamUrl, setStreamUrl] = React.useState(system.stream_url);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(streamType, streamUrl);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel w-full max-w-md rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-base font-bold font-display uppercase tracking-wider text-slate-200">
            Source Setup: {system.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono tracking-wide text-slate-500 uppercase mb-2">Stream Type</label>
            <select
              value={streamType}
              onChange={(e) => setStreamType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 text-slate-200 rounded px-3 py-2 text-sm focus:outline-none transition"
            >
              <option value="OBS Stream">OBS Stream</option>
              <option value="WebRTC Stream">WebRTC Stream</option>
              <option value="Browser Dashboard">Browser Dashboard</option>
              <option value="Remote Desktop Feed">Remote Desktop Feed</option>
              <option value="Camera Feed">Camera Feed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wide text-slate-500 uppercase mb-2">Stream Source Address</label>
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="rtsp://... or https://..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 text-slate-200 rounded px-3 py-2 text-sm focus:outline-none transition font-mono"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-900">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── MOUNT ───────────────────────────────────────────────────
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
