// ============================================================
// AI OPERATIONS COMMAND CENTER — app.js
// React 18, Tailwind CSS, Canvas simulators + HLS video player
// ============================================================

const AUTH_STORAGE_KEY = 'pmg_ops_authenticated';
const DASHBOARD_PASSWORD = '14mo17z!';

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
  ),
  Lock: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21m-6.878-6.878l3.242 3.243" />
    </svg>
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

// ─── STREAM TYPE DETECTOR ────────────────────────────────────
// Returns: 'hls' | 'iframe' | 'simulation'
const detectStreamMode = (url) => {
  if (!url) return 'simulation';
  const u = url.toLowerCase();
  if (u.includes('.m3u8')) return 'hls';
  if (u.startsWith('http://') || u.startsWith('https://')) return 'iframe';
  return 'simulation';
};

// ─── HLS VIDEO PLAYER ────────────────────────────────────────
const HLSPlayer = ({ url, systemName }) => {
  const videoRef = React.useRef(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setError(null);
    setLoading(true);

    // Check if native HLS supported (Safari) or need hls.js
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadeddata', () => setLoading(false));
      video.addEventListener('error', () => setError('Stream unavailable'));
      video.play().catch(() => {});
    } else {
      // Load hls.js dynamically
      if (window.Hls) {
        initHls(video);
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.onload = () => initHls(video);
        script.onerror = () => setError('Failed to load HLS player');
        document.head.appendChild(script);
      }
    }

    function initHls(video) {
      if (!window.Hls || !window.Hls.isSupported()) {
        setError('HLS not supported in this browser');
        return;
      }
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {});
      });
      hls.on(window.Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Stream connection failed — check MediaMTX is running and OBS is streaming');
        }
      });
      return () => hls.destroy();
    }
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/80">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-emerald-400 font-mono text-xs">CONNECTING TO STREAM...</p>
          <p className="text-slate-500 font-mono text-[10px] mt-1">{url}</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950">
          <div className="text-red-400 font-mono text-sm font-bold mb-2">⚠ STREAM OFFLINE</div>
          <div className="text-slate-400 font-mono text-xs text-center max-w-sm px-4">{error}</div>
          <div className="mt-4 text-slate-600 font-mono text-[10px] text-center max-w-xs px-4">
            Make sure MediaMTX is running and OBS is streaming to:<br/>
            <span className="text-emerald-600">{url}</span>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
        controls
      />
    </div>
  );
};

// ─── IFRAME PLAYER ───────────────────────────────────────────
const IframePlayer = ({ url, systemName }) => {
  const [error, setError] = React.useState(false);

  return (
    <div className="relative w-full h-full bg-slate-950">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-red-400 font-mono text-sm font-bold mb-2">⚠ FAILED TO LOAD</div>
          <div className="text-slate-400 font-mono text-xs">{url}</div>
          <div className="text-slate-600 font-mono text-[10px] mt-2">Page may be blocking iframe embedding</div>
        </div>
      ) : (
        <iframe
          src={url}
          className="w-full h-full border-0"
          onError={() => setError(true)}
          allow="autoplay; fullscreen"
          title={systemName}
        />
      )}
    </div>
  );
};

// ─── PASSWORD GATE ───────────────────────────────────────────
const PasswordGate = ({ onUnlock }) => {
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [shake, setShake] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      try { sessionStorage.setItem(AUTH_STORAGE_KEY, 'true'); } catch (e) {}
      setError('');
      onUnlock();
    } else {
      setError('Incorrect password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* subtle background texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)',
        backgroundSize: '28px 28px'
      }}></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>

      <div className={`relative w-full max-w-sm mx-4 ${shake ? 'animate-[shake_0.4s]' : ''}`}>
        <style>{`@keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-6px); } 40%,80% { transform: translateX(6px); } }`}</style>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 flex flex-col items-center border-b border-gray-100">
            <img
              src="/static/pmg.logo.png"
              alt="Company Logo"
              className="h-14 w-auto object-contain mb-5"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
              <Icons.Lock />
            </div>
            <h1 className="text-base font-bold text-gray-800 tracking-wide font-display uppercase">Restricted Access</h1>
            <p className="text-xs text-gray-400 font-mono mt-1 tracking-wide text-center">Mining Operations Command Center</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-[11px] font-mono tracking-wide text-gray-500 uppercase mb-2">Access Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  placeholder="Enter password"
                  autoFocus
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-gray-800 rounded-lg pl-4 pr-11 py-2.5 text-sm outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-2 font-medium">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm transition"
            >
              Access Dashboard
            </button>
          </form>

          <div className="px-8 pb-6 text-center">
            <p className="text-[10px] text-gray-400 font-mono tracking-wide">SECURE OPERATOR LOGIN // AUTHORIZED PERSONNEL ONLY</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ROOT APP ────────────────────────────────────────────────
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
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
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
          setAlerts([]); setAiAnalysis([]); setActivityFeed([]);
        }
      };
      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 3000);
      };
      ws.onerror = () => ws.close();
    };
    connectWS();
    return () => { if (ws) ws.close(); clearTimeout(reconnectTimeout); };
  }, []);

  const handleReconnect = async (systemId) => {
    try { await fetch(`/api/systems/${systemId}/reconnect`, { method: 'POST' }); } catch (e) {}
  };

  const handleUpdateConfig = async (systemId, streamType, streamUrl) => {
    try {
      const res = await fetch(`/api/systems/${systemId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_type: streamType, stream_url: streamUrl })
      });
      if (res.ok) setConfigModalSystem(null);
    } catch (e) {}
  };

  const handleClearLogs = async () => {
    try { await fetch('/api/clear', { method: 'POST' }); } catch (e) {}
  };

  return (
    <div className="flex h-full w-full bg-gray-50 font-sans overflow-hidden">
      <Sidebar systems={systems} selectedSystem={selectedSystem} setSelectedSystem={setSelectedSystem} wsConnected={wsConnected} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-14 border-b border-gray-200 bg-white/90 backdrop-blur flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <h1 className="text-lg font-semibold tracking-wider font-display text-gray-800 uppercase">AI Operations Command Center</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-xs text-gray-500 bg-gray-100 py-1 px-3 rounded-full border border-gray-200">
              {wsConnected ? <Icons.Connected /> : <Icons.Disconnected />}
              <span className="font-mono tracking-wide">{wsConnected ? "STREAM STABLE" : "DISCONNECTED"}</span>
            </div>
            <button onClick={handleClearLogs} className="text-xs font-semibold px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition">Clear Logs</button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col p-4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            {selectedSystem === 'overview' ? (
              <OverviewDashboard systems={systems} alerts={alerts} aiAnalysis={aiAnalysis} setSelectedSystem={setSelectedSystem} />
            ) : (
              <ScreenMirror
                system={systems[selectedSystem]}
                alerts={alerts.filter(a => a.system_id === selectedSystem)}
                onReconnect={() => handleReconnect(selectedSystem)}
                onConfigClick={() => setConfigModalSystem(systems[selectedSystem])}
              />
            )}
          </div>
          <RightPanel activeTab={activeTab} setActiveTab={setActiveTab} alerts={alerts} aiAnalysis={aiAnalysis} activityFeed={activityFeed} selectedSystem={selectedSystem} />
        </div>
      </div>
      {configModalSystem && (
        <ConfigModal system={configModalSystem} onClose={() => setConfigModalSystem(null)} onSave={(type, url) => handleUpdateConfig(configModalSystem.id, type, url)} />
      )}
    </div>
  );
};

// ─── SIDEBAR ─────────────────────────────────────────────────
const Sidebar = ({ systems, selectedSystem, setSelectedSystem, wsConnected }) => {
  const systemKeys = ['abcotronics', 'tontrac', 'weighbridge_camera', 'nimbus', 'sde', 'bidtrack'];
  return (
    <div className="w-64 border-r border-gray-200 bg-white flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-gray-200 shrink-0">
        <div className="flex items-center space-x-3">
          <img
            src="/static/pmg.logo.png"
            alt="Company Logo"
            className="h-10 w-auto object-contain shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-800 text-sm tracking-wide truncate">MINERALS OPS</h2>
            <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Autonomous Core</p>
          </div>
        </div>
      </div>
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        <button onClick={() => setSelectedSystem('overview')} className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition duration-150 ${selectedSystem === 'overview' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
          <span className={`mr-3 ${selectedSystem === 'overview' ? 'text-emerald-600' : 'text-gray-400'}`}><Icons.Overview /></span>
          <span className="font-display uppercase tracking-wider text-xs">Operations Overview</span>
        </button>
        <div className="h-px bg-gray-200 my-4"></div>
        <div className="px-3 mb-2"><p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">Operational Units</p></div>
        {systemKeys.map((key) => {
          const sys = systems[key];
          if (!sys) return null;
          const isSelected = selectedSystem === key;
          const isOnline = sys.status === 'online';
          const mode = detectStreamMode(sys.stream_url);
          return (
            <button key={key} onClick={() => setSelectedSystem(key)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition duration-150 ${isSelected ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
              <div className="flex items-center">
                <span className={`mr-3 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>{getSystemIcon(key)}</span>
                <div className="text-left">
                  <span className="font-display uppercase tracking-wider text-xs block">{sys.name}</span>
                  {mode !== 'simulation' && <span className="text-[9px] text-emerald-600 font-mono">● LIVE</span>}
                </div>
              </div>
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'}`}></span>
            </button>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-200 text-[10px] font-mono text-gray-400 bg-gray-50 shrink-0">
        <div>CORE OS: v4.81.2-ALPHA</div>
        <div>SYS CLK: {new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
};

// ─── SCREEN MIRROR ────────────────────────────────────────────
const ScreenMirror = ({ system, alerts, onReconnect, onConfigClick }) => {
  const containerRef = React.useRef(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  if (!system) return <div className="text-gray-500 font-mono">Loading system stream...</div>;

  const streamMode = detectStreamMode(system.stream_url);

  React.useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen && containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
      {/* Header bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center shrink-0 z-10">
        <div>
          <div className="text-xs font-mono text-gray-500 flex items-center space-x-2">
            <span>{system.stream_type}</span>
            <span>•</span>
            <span className="truncate max-w-[220px]" title={system.stream_url}>{system.stream_url}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              streamMode === 'hls' ? 'bg-emerald-100 text-emerald-700' :
              streamMode === 'iframe' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {streamMode === 'hls' ? 'HLS LIVE' : streamMode === 'iframe' ? 'WEB EMBED' : 'SIMULATION'}
            </span>
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-800 uppercase font-display">{system.name} Stream Mirror</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onReconnect} className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition">
            <Icons.Refresh /><span>Reconnect</span>
          </button>
          <button onClick={onConfigClick} className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition">
            <Icons.Settings /><span>Source</span>
          </button>
          <button onClick={toggleFullscreen} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition">
            <Icons.Fullscreen />
          </button>
        </div>
      </div>

      {/* Stream content area (left dark, matches native camera/monitor feed convention) */}
      <div className="flex-1 relative overflow-hidden bg-[#020508]">
        {streamMode === 'hls' && <HLSPlayer url={system.stream_url} systemName={system.name} />}
        {streamMode === 'iframe' && <IframePlayer url={system.stream_url} systemName={system.name} />}
        {streamMode === 'simulation' && <CanvasSimulator system={system} alerts={alerts} />}
      </div>
    </div>
  );
};

// ─── CANVAS SIMULATOR ────────────────────────────────────────
// NOTE: left unchanged per instructions to not touch streaming/camera functionality —
// this renders the simulated live feed exactly as before.
const CanvasSimulator = ({ system, alerts }) => {
  const canvasRef = React.useRef(null);
  const isOnline = system.status === 'online';
  const hasCriticalWarning = alerts.some(a => ['critical', 'error', 'warning'].includes(a.severity));

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let frame = 0;

    const pathPoints = [
      { x: 100, y: 150 }, { x: 220, y: 150 }, { x: 320, y: 250 },
      { x: 480, y: 250 }, { x: 580, y: 100 }, { x: 700, y: 100 }
    ];
    let trucks = [
      { id: "TRK-01", progress: 0.1, speed: 0.0012 },
      { id: "TRK-02", progress: 0.45, speed: 0.0009 },
      { id: "TRK-03", progress: 0.8, speed: 0.0016 }
    ];
    let wbTruckX = -100, wbWeight = 0, wbState = 'entering';
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
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    };

    const render = () => {
      frame++;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060a0f';
      ctx.fillRect(0, 0, w, h);
      drawGrid(w, h);

      if (!isOnline) {
        const imgData = ctx.createImageData(w, h);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const v = Math.floor(Math.random() * 255);
          imgData.data[i] = v; imgData.data[i+1] = v; imgData.data[i+2] = v; imgData.data[i+3] = 40;
        }
        ctx.putImageData(imgData, 0, 0);
        ctx.fillStyle = '#f87171'; ctx.font = '700 24px Rajdhani'; ctx.textAlign = 'center';
        ctx.fillText("CRITICAL FEED DISRUPTION: NO SIGNAL", w / 2, h / 2 - 5);
        ctx.fillStyle = '#94a3b8'; ctx.font = '500 14px Outfit';
        ctx.fillText("FEED DISCONNECTED — CHECK NODE OR ROUTER", w / 2, h / 2 + 25);
        animationId = requestAnimationFrame(render);
        return;
      }

      if (system.id === 'abcotronics') {
        ctx.fillStyle = '#06b6d4'; ctx.font = '700 18px Rajdhani'; ctx.textAlign = 'left';
        ctx.fillText("ABCOTRONICS PLC TELEMETRY // CORE PROCESS MONITOR", 40, 50);
        if (frame % 5 === 0) { abcPoints.push(system.metrics.efficiency + (Math.random() * 4 - 2)); abcPoints.shift(); }
        const gW = w - 100, gH = h - 220, sX = 50, sY = h - 80;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(sX, sY - (abcPoints[0] - 50) * (gH / 50));
        for (let i = 1; i < abcPoints.length; i++) ctx.lineTo(sX + (i * (gW / (abcPoints.length - 1))), sY - (abcPoints[i] - 50) * (gH / 50));
        ctx.stroke();
        ctx.fillStyle = '#94a3b8'; ctx.font = '600 12px Rajdhani';
        ctx.fillText(`THROUGHPUT: ${system.metrics.throughput} T/H`, 50, h - 45);
        ctx.fillText(`EFFICIENCY: ${system.metrics.efficiency}%`, 220, h - 45);
        ctx.fillStyle = system.metrics.temp > 55 ? '#f87171' : '#34d399';
        ctx.fillText(`SYS TEMP: ${system.metrics.temp} °C`, 390, h - 45);

      } else if (system.id === 'tontrac') {
        ctx.fillStyle = '#10b981'; ctx.font = '700 18px Rajdhani'; ctx.textAlign = 'left';
        ctx.fillText("TONTRAC HAULAGE & DISPATCH SYSTEM // LIVE ROAD NETWORK", 40, 50);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        ctx.stroke();
        trucks.forEach(truck => {
          truck.progress += truck.speed;
          if (truck.progress > 1) { truck.progress = 0; truck.speed = 0.0008 + Math.random() * 0.001; }
          const si = Math.floor(truck.progress * (pathPoints.length - 1));
          if (si < pathPoints.length - 1) {
            const seg = (truck.progress * (pathPoints.length - 1)) - si;
            const p1 = pathPoints[si], p2 = pathPoints[si + 1];
            const x = p1.x + (p2.x - p1.x) * seg, y = p1.y + (p2.y - p1.y) * seg;
            ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f1f5f9'; ctx.font = '600 10px Fira Code'; ctx.fillText(truck.id, x + 12, y + 4);
          }
        });

      } else if (system.id === 'weighbridge_camera') {
        ctx.fillStyle = '#22d3ee'; ctx.font = '700 18px Rajdhani'; ctx.textAlign = 'left';
        ctx.fillText("WEIGHBRIDGE LPR CORE // CAM-02 INTEGRATION", 40, 50);
        const scaleX = w / 2 - 150, scaleY = h / 2 + 20;
        ctx.fillStyle = '#1e293b'; ctx.fillRect(scaleX, scaleY, 300, 20);
        ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.strokeRect(scaleX, scaleY, 300, 20);
        if (wbState === 'entering') { wbTruckX += 3; if (wbTruckX >= w / 2 - 80) { wbState = 'weighing'; frame = 0; } }
        else if (wbState === 'weighing') { wbWeight = Math.min(28.45, wbWeight + 1.25); if (frame > 90) wbState = 'exiting'; }
        else if (wbState === 'exiting') { wbTruckX += 4; wbWeight = Math.max(0, wbWeight - 2.5); if (wbTruckX > w + 100) { wbTruckX = -150; wbState = 'entering'; wbWeight = 0; } }
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2;
        ctx.fillRect(wbTruckX, scaleY - 60, 160, 58); ctx.strokeRect(wbTruckX, scaleY - 60, 160, 58);
        if (wbState === 'weighing') {
          ctx.fillStyle = '#f43f5e'; ctx.font = '600 12px Fira Code'; ctx.textAlign = 'center';
          ctx.fillText(`OCR HIT: [${system.metrics.last_ocr}]`, w / 2, h / 2 - 100);
        }
        ctx.fillStyle = '#22d3ee'; ctx.font = '700 20px Rajdhani'; ctx.textAlign = 'center';
        ctx.fillText(`${wbWeight.toFixed(2)} TONNES`, w / 2, scaleY + 60);

      } else if (system.id === 'nimbus') {
        ctx.fillStyle = '#a855f7'; ctx.font = '700 18px Rajdhani'; ctx.textAlign = 'left';
        ctx.fillText("NIMBUS CLOUD CONTAINER CLUSTER HUB", 40, 50);
        const nW = (w - 120) / 3, nH = h - 220;
        for (let i = 0; i < 3; i++) {
          const nX = 40 + i * (nW + 20);
          const load = i === 1 ? system.metrics.cpu_load : (40 + Math.sin(frame * 0.05 + i) * 8);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; ctx.strokeStyle = load > 80 ? '#ef4444' : '#a855f7'; ctx.lineWidth = 1.5;
          ctx.fillRect(nX, 100, nW, nH); ctx.strokeRect(nX, 100, nW, nH);
          ctx.fillStyle = load > 80 ? '#ef4444' : '#a855f7'; ctx.font = '600 13px Rajdhani';
          ctx.fillText(`NODE 0${i + 1}: ${load.toFixed(1)}%`, nX + 20, 295);
        }

      } else if (system.id === 'sde') {
        ctx.fillStyle = '#64748b'; ctx.font = '700 18px Rajdhani'; ctx.textAlign = 'left';
        ctx.fillText("SDE DEPLOYMENT PIPELINE // COMPILE & BUILD CONSOLE", 40, 50);
        ctx.fillStyle = '#020617'; ctx.fillRect(40, 70, w - 80, h - 160);
        const cmds = ["$ git checkout main","Already on 'main'","$ npm run build","> sde-pipeline@4.2.1 build","vite v5.0.12 building...","✓ 412 modules transformed.","✓ built in 4.85s","$ docker build -t mining-ops:latest .","Step 1/8 : FROM python:3.11-alpine","Step 2/8 : WORKDIR /app","Step 3/8 : COPY requirements.txt .","Step 4/8 : RUN pip install -r requirements.txt","Successfully installed uvicorn fastapi","$ kubectl apply -f deployment.yaml","deployment.apps/mining-ops configured"];
        ctx.fillStyle = '#38bdf8'; ctx.font = '12px Fira Code';
        const li = Math.floor(frame / 6) % cmds.length;
        for (let l = 0; l < 14; l++) ctx.fillText(cmds[(li - 14 + l + cmds.length) % cmds.length], 60, 110 + l * 20);

      } else if (system.id === 'bidtrack') {
        ctx.fillStyle = '#eab308'; ctx.font = '700 18px Rajdhani'; ctx.textAlign = 'left';
        ctx.fillText("BIDTRACK REAL-TIME COMMODITIES MARKET LOG", 40, 50);
        if (frame % 15 === 0) { bidPrices.push(system.metrics.avg_bid_value + (Math.random() * 200 - 100)); bidPrices.shift(); }
        const bW = w - 100, bH = h - 220, bX = 50, bY = h - 80;
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2.5; ctx.beginPath();
        ctx.moveTo(bX, bY - (bidPrices[0] - 11000) * (bH / 3000));
        for (let i = 1; i < bidPrices.length; i++) ctx.lineTo(bX + (i * (bW / (bidPrices.length - 1))), bY - (bidPrices[i] - 11000) * (bH / 3000));
        ctx.stroke();
        ctx.fillStyle = '#f8fafc'; ctx.font = '500 11px Outfit';
        ctx.fillText(`Avg Bid: $${system.metrics.avg_bid_value} | Active: ${system.metrics.current_bids} | Pending: ${system.metrics.pending_deals}`, 50, h - 45);
      }

      if (hasCriticalWarning) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(frame * 0.1) * 0.3})`;
        ctx.lineWidth = 4; ctx.strokeRect(0, 0, w, h);
        ctx.fillStyle = '#ef4444'; ctx.font = '700 12px Fira Code'; ctx.textAlign = 'right';
        ctx.fillText("WARNING // AI DETECTION ENGAGED", w - 40, 50);
      }
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'; ctx.font = '500 10px Fira Code'; ctx.textAlign = 'right';
      ctx.fillText(`SIMULATION MODE // FPS: 60 // STREAM: CANVAS`, w - 40, h - 35);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resizeCanvas); };
  }, [system, isOnline, hasCriticalWarning]);

  return (
    <div className="absolute inset-0 scanlines">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// ─── OVERVIEW DASHBOARD ──────────────────────────────────────
const OverviewDashboard = ({ systems, alerts, aiAnalysis, setSelectedSystem }) => {
  const keys = Object.keys(systems);
  const activeAlerts = alerts.filter(a => ['critical', 'error', 'warning'].includes(a.severity));
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-lg border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div><div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">SYS INTEGRITY</div><div className="text-xl font-bold font-display text-gray-800">100% SECURE</div></div>
        </div>
        <div className="glass-panel p-5 rounded-lg border border-gray-200 flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${activeAlerts.length > 0 ? 'bg-red-50 text-red-600 animate-pulse-slow' : 'bg-gray-100 text-gray-400'}`}><Icons.Alert className="w-6 h-6" /></div>
          <div><div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">ACTIVE ALERTS</div><div className={`text-xl font-bold font-display ${activeAlerts.length > 0 ? 'text-red-600' : 'text-gray-800'}`}>{activeAlerts.length} TRIGGERED</div></div>
        </div>
        <div className="glass-panel p-5 rounded-lg border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div><div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">AI INSIGHTS</div><div className="text-xl font-bold font-display text-gray-800">{aiAnalysis.length} LOGGED</div></div>
        </div>
        <div className="glass-panel p-5 rounded-lg border border-gray-200 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          </div>
          <div><div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">ONLINE FEEDS</div><div className="text-xl font-bold font-display text-gray-800">{keys.filter(k => systems[k]?.status === 'online').length} / {keys.length} ACTIVE</div></div>
        </div>
      </div>

      <div>
        <div className="flex items-center mb-4"><h3 className="text-xs font-mono tracking-widest text-gray-500 uppercase">System Status</h3><span className="h-px bg-gray-200 flex-1 mx-4"></span></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {keys.map((key) => {
            const sys = systems[key];
            if (!sys) return null;
            const isOnline = sys.status === 'online';
            const sysAlerts = alerts.filter(a => a.system_id === key && a.severity !== 'info').length;
            const mode = detectStreamMode(sys.stream_url);
            return (
              <div key={key} onClick={() => setSelectedSystem(key)} className={`glass-panel p-5 rounded-lg border transition duration-200 cursor-pointer hover:-translate-y-0.5 ${isOnline ? 'border-gray-200 hover:border-emerald-300' : 'border-red-200 bg-red-50/40'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className={isOnline ? 'text-emerald-600' : 'text-red-500'}>{getSystemIcon(key)}</span>
                    <h4 className="font-semibold text-gray-800 text-sm uppercase font-display">{sys.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {mode !== 'simulation' && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-mono rounded">LIVE</span>}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${isOnline ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>{isOnline ? "ONLINE" : "OFFLINE"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-gray-100 pt-3">
                  {Object.entries(sys.metrics || {}).slice(0, 2).map(([k, val]) => (
                    <div key={k}><div className="uppercase text-[9px] text-gray-400">{k.replace(/_/g, ' ')}</div><div className="text-gray-700 font-semibold">{val}</div></div>
                  ))}
                </div>
                {sysAlerts > 0 ? (
                  <div className="mt-3 flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 py-1.5 px-2.5 rounded border border-amber-200">
                    <Icons.Alert className="w-3.5 h-3.5" /><span>{sysAlerts} active warnings</span>
                  </div>
                ) : <div className="mt-3 text-[10px] text-gray-400 font-mono">✓ No anomalies flagged</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-lg border border-gray-200">
        <h4 className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-4">Latest AI Observations</h4>
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
          {aiAnalysis.length > 0 ? aiAnalysis.slice(0, 5).map((item) => (
            <div key={item.id} className="flex justify-between items-start text-xs border-b border-gray-100 pb-2.5 last:border-none">
              <div><span className="font-bold text-emerald-700 uppercase mr-2">[{item.system_name}]</span><span className="text-gray-700">{item.insight}</span></div>
              <span className="text-[10px] text-gray-400 font-mono ml-4">{item.timestamp}</span>
            </div>
          )) : <div className="text-xs text-gray-400 font-mono py-2">Waiting for AI telemetry...</div>}
        </div>
      </div>
    </div>
  );
};

// ─── RIGHT PANEL ─────────────────────────────────────────────
const RightPanel = ({ activeTab, setActiveTab, alerts, aiAnalysis, activityFeed, selectedSystem }) => {
  const fA = selectedSystem === 'overview' ? alerts : alerts.filter(a => a.system_id === selectedSystem);
  const fAI = selectedSystem === 'overview' ? aiAnalysis : aiAnalysis.filter(a => a.system_id === selectedSystem);
  const fAct = selectedSystem === 'overview' ? activityFeed : activityFeed.filter(a => a.system_id === selectedSystem);
  const sev = (s) => ({ critical: 'bg-red-50 border-red-200 text-red-700', error: 'bg-red-50 border-red-100 text-red-600', warning: 'bg-amber-50 border-amber-200 text-amber-700', info: 'bg-emerald-50 border-emerald-200 text-emerald-700' }[s] || 'bg-gray-100 border-gray-200 text-gray-700');
  const tc = (t) => `py-3.5 text-xs font-semibold tracking-wide border-b-2 transition font-display uppercase ${activeTab === t ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' : 'border-transparent text-gray-500 hover:text-gray-800'}`;
  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full shrink-0">
      <div className="grid grid-cols-3 border-b border-gray-200 shrink-0">
        <button onClick={() => setActiveTab('alerts')} className={tc('alerts')}>Alerts {fA.length > 0 && `(${fA.length})`}</button>
        <button onClick={() => setActiveTab('analysis')} className={tc('analysis')}>AI Analysis</button>
        <button onClick={() => setActiveTab('activity')} className={tc('activity')}>Activity</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'alerts' && (fA.length > 0 ? fA.map(a => (
          <div key={a.id} className={`p-3 rounded border text-xs leading-relaxed ${sev(a.severity)}`}>
            <div className="flex justify-between mb-1"><span className="font-bold font-display uppercase">{a.system_name}</span><span className="font-mono text-[9px] opacity-60">{a.timestamp}</span></div>
            <p>{a.message}</p>
          </div>
        )) : <div className="text-xs text-gray-400 font-mono py-8 text-center">No active warnings</div>)}
        {activeTab === 'analysis' && (fAI.length > 0 ? fAI.map(i => (
          <div key={i.id} className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
            <div className="flex justify-between mb-2"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded text-[9px] font-mono uppercase">{i.category}</span><span className="font-mono text-[9px] text-gray-400">{i.timestamp}</span></div>
            <div className="text-[10px] uppercase font-mono text-gray-400 mb-1">[{i.system_name}]</div>
            <p className="text-gray-800">{i.insight}</p>
          </div>
        )) : <div className="text-xs text-gray-400 font-mono py-8 text-center">No AI logs yet</div>)}
        {activeTab === 'activity' && (
          <div className="relative border-l border-gray-200 pl-4 space-y-4 py-2 ml-1">
            {fAct.length > 0 ? fAct.map(a => (
              <div key={a.id} className="relative text-xs">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white"></div>
                <div className="text-gray-400 font-mono text-[9px] mb-0.5">{a.timestamp} • {a.system_name}</div>
                <p className="text-gray-700">{a.message}</p>
              </div>
            )) : <div className="text-xs text-gray-400 font-mono py-8">No activity yet</div>}
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
  const mode = detectStreamMode(streamUrl);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-lg overflow-hidden border border-gray-200 shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-base font-bold font-display uppercase tracking-wider text-gray-800">Source Setup: {system.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono tracking-wide text-gray-500 uppercase mb-2">Stream Type</label>
            <select value={streamType} onChange={e => setStreamType(e.target.value)} className="w-full bg-white border border-gray-300 focus:border-emerald-500 text-gray-800 rounded px-3 py-2 text-sm focus:outline-none transition">
              <option value="OBS Stream">OBS Stream</option>
              <option value="WebRTC Stream">WebRTC Stream</option>
              <option value="Browser Dashboard">Browser Dashboard</option>
              <option value="Remote Desktop Feed">Remote Desktop Feed</option>
              <option value="Camera Feed">Camera Feed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wide text-gray-500 uppercase mb-2">Stream Source URL</label>
            <input type="text" value={streamUrl} onChange={e => setStreamUrl(e.target.value)} placeholder="http://localhost:8888/stream/index.m3u8" className="w-full bg-white border border-gray-300 focus:border-emerald-500 text-gray-800 rounded px-3 py-2 text-sm focus:outline-none transition font-mono" />
          </div>

          {/* Live mode preview */}
          <div className={`p-3 rounded border text-xs font-mono ${
            mode === 'hls' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            mode === 'iframe' ? 'bg-blue-50 border-blue-200 text-blue-700' :
            'bg-gray-50 border-gray-200 text-gray-400'
          }`}>
            {mode === 'hls' && '● HLS LIVE STREAM — will play via video player'}
            {mode === 'iframe' && '● WEB EMBED — will load URL in iframe'}
            {mode === 'simulation' && '○ SIMULATION MODE — enter an .m3u8 or http:// URL to go live'}
          </div>

          {mode === 'hls' && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[10px] font-mono text-gray-500 space-y-1">
              <div className="text-gray-700 font-semibold mb-1">MediaMTX HLS URL format:</div>
              <div>http://localhost:8888/<span className="text-emerald-700">streamkey</span>/index.m3u8</div>
              <div className="text-gray-400">Make sure MediaMTX is running and OBS is streaming</div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 rounded text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition">Cancel</button>
            <button onClick={() => onSave(streamType, streamUrl)} className="px-4 py-2 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition">Save Configuration</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── AUTH WRAPPER ─────────────────────────────────────────────
const AuthenticatedApp = () => {
  const [authenticated, setAuthenticated] = React.useState(() => {
    try { return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'; } catch (e) { return false; }
  });

  if (!authenticated) {
    return <PasswordGate onUnlock={() => setAuthenticated(true)} />;
  }
  return <App />;
};

// ─── MOUNT ────────────────────────────────────────────────────
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<AuthenticatedApp />);