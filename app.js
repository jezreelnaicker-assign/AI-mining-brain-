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

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadeddata', () => setLoading(false));
      video.addEventListener('error', () => setError('Stream unavailable'));
      video.play().catch(() => {});
    } else {
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
          setError('Stream connection failed — check MediaMTX is running and the tunnel URL is correct');
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
          <p className="text-slate-500 font-mono text-[10px] mt-1 break-all px-4 text-center">{url}</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950">
          <div className="text-red-400 font-mono text-sm font-bold mb-2">⚠ STREAM OFFLINE</div>
          <div className="text-slate-400 font-mono text-xs text-center max-w-sm px-4">{error}</div>
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

// ─── TONTRAC DASHBOARD ────────────────────────────────────────
// Shows real tickets/orders pushed from TonTrac, live over the
// websocket, plus whatever was already stored on page load.
const TontracDashboard = ({ tickets, orders }) => {
  return (
    <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        <div className="glass-panel p-4 rounded-lg border border-gray-200">
          <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">Weighbridge Tickets</div>
          <div className="text-xl font-bold font-display text-gray-800">{tickets.length} received</div>
          <div className="text-[10px] text-gray-400 font-mono mt-1">
            {tickets.length > 0 ? `Last: ${tickets[0]._received_at}` : 'Waiting for first push...'}
          </div>
        </div>
        <div className="glass-panel p-4 rounded-lg border border-gray-200">
          <div className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">Orders</div>
          <div className="text-xl font-bold font-display text-gray-800">{orders.length} received</div>
          <div className="text-[10px] text-gray-400 font-mono mt-1">
            {orders.length > 0 ? `Last: ${orders[0]._received_at}` : 'Waiting for first push...'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Tickets table */}
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-bold font-display uppercase text-gray-700">Recent Tickets</div>
          <div className="flex-1 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="text-xs text-gray-400 font-mono p-4 text-center">No tickets received yet</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-mono">Time</th>
                    <th className="text-left px-3 py-2 font-mono">Ticket No</th>
                    <th className="text-left px-3 py-2 font-mono">Vehicle</th>
                    <th className="text-left px-3 py-2 font-mono">Product</th>
                    <th className="text-right px-3 py-2 font-mono">Net Wt (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t, i) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-gray-400">{t._received_at}</td>
                      <td className="px-3 py-2 text-gray-800 font-semibold">{t.TicketNo}</td>
                      <td className="px-3 py-2 text-gray-600">{t.VehicleRegNo}</td>
                      <td className="px-3 py-2 text-gray-600">{t.ProductName}</td>
                      <td className="px-3 py-2 text-right text-gray-800 font-mono">{t.NettWeightKgs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Orders table */}
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-bold font-display uppercase text-gray-700">Recent Orders</div>
          <div className="flex-1 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-xs text-gray-400 font-mono p-4 text-center">No orders received yet</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-mono">Time</th>
                    <th className="text-left px-3 py-2 font-mono">Order No</th>
                    <th className="text-left px-3 py-2 font-mono">Product</th>
                    <th className="text-left px-3 py-2 font-mono">Dispatch → Receipt</th>
                    <th className="text-right px-3 py-2 font-mono">Est. Mass</th>
                    <th className="text-left px-3 py-2 font-mono">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-gray-400">{o._received_at}</td>
                      <td className="px-3 py-2 text-gray-800 font-semibold">{o.OrderNo}</td>
                      <td className="px-3 py-2 text-gray-600">{o.ProductName}</td>
                      <td className="px-3 py-2 text-gray-600">{o.DispatchLocationName} → {o.ReceiptLocationName}</td>
                      <td className="px-3 py-2 text-right text-gray-800 font-mono">{o.EstimatedMass}</td>
                      <td className="px-3 py-2">
                        {o.IsComplete ? (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-mono">COMPLETE</span>
                        ) : o.IsOpen ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-mono">OPEN</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SDE CAMERA DASHBOARD ────────────────────────────────────
// FIX: was using a raw <video src=...> tag, which cannot play .m3u8
// (HLS) streams in Chrome/Edge/Firefox — only Safari supports that
// natively. Now routes through HLSPlayer (hls.js), same as every
// other camera tile on the dashboard. Thumbnails no longer try to
// run 40+ simultaneous live video decoders — only the selected
// camera actually decodes video; others are static tiles.
function SDECameraDashboard() {
    const [cameras, setCameras] = React.useState([]);
    const [filteredCameras, setFilteredCameras] = React.useState([]);
    const [activeCam, setActiveCam] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    React.useEffect(() => {
        fetch('/api/cameras/streams')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setCameras(data.cameras);
                    setFilteredCameras(data.cameras);
                    if (data.cameras.length > 0) {
                        setActiveCam(data.cameras[0]);
                    }
                }
            })
            .catch(err => console.error("Error loading cameras:", err));
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = cameras.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.site.toLowerCase().includes(query) ||
            c.ip.includes(query)
        );
        setFilteredCameras(filtered);
    };

    return (
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-slate-950 text-white overflow-hidden">
            {/* Primary Monitor Section — uses HLSPlayer (hls.js), NOT a raw <video src> */}
            <div className="lg:col-span-3 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold font-display text-emerald-400">
                        {activeCam ? `${activeCam.name} (Primary View)` : "Initializing Feed..."}
                    </h3>
                    <span className="text-xs font-mono bg-slate-800 text-cyan-400 px-3 py-1 rounded border border-slate-700">
                        {activeCam ? activeCam.ip : "---.---.---.---"}
                    </span>
                </div>
                <div className="flex-1 bg-black rounded-lg overflow-hidden relative border border-slate-800">
                    {activeCam ? (
                        <HLSPlayer key={activeCam.url} url={activeCam.url} systemName={activeCam.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm">No Active Camera Selected</div>
                    )}
                </div>
            </div>

            {/* Sidebar Camera List & Search — static tiles, no live video per row */}
            <div className="lg:col-span-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl overflow-hidden">
                <div className="flex flex-col gap-3 mb-3">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-300">All Site Feeds</h4>
                        <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                            {filteredCameras.length} Active
                        </span>
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by name, site or IP..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-emerald-500 font-mono"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredCameras.map((cam) => {
                        const isSelected = activeCam && activeCam.id === cam.id;
                        return (
                            <div
                                key={cam.id}
                                onClick={() => setActiveCam(cam)}
                                className={`p-2 rounded-md cursor-pointer border transition-all ${
                                    isSelected
                                        ? 'bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-900/50'
                                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                                }`}
                            >
                                <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                                    <span className="text-cyan-400 font-semibold">{cam.site}</span>
                                    <span className="text-slate-400">{cam.ip}</span>
                                </div>
                                <div className="text-xs font-bold text-slate-200 truncate mb-2">{cam.name}</div>
                                <div className="h-16 bg-black rounded overflow-hidden relative border border-slate-800/80 flex items-center justify-center">
                                    {isSelected ? (
                                        <span className="text-[9px] font-mono text-emerald-400">● PLAYING ABOVE</span>
                                    ) : (
                                        <span className="text-[9px] font-mono text-slate-600">Click to view</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

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
              {error && <p className="text-red-600 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg shadow-sm transition"
            >
              Access Dashboard
            </button>
          </form>
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
  const [tontracTickets, setTontracTickets] = React.useState([]);
  const [tontracOrders, setTontracOrders] = React.useState([]);
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
          setTontracTickets(msg.tontrac_tickets || []);
          setTontracOrders(msg.tontrac_orders || []);
        } else if (msg.type === 'NEW_TONTRAC_TICKETS') {
          setTontracTickets(prev => [...msg.data, ...prev].slice(0, 200));
        } else if (msg.type === 'NEW_TONTRAC_ORDERS') {
          setTontracOrders(prev => [...msg.data, ...prev].slice(0, 200));
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
            ) : selectedSystem === 'sde' ? (
              <SDECameraDashboard />
            ) : selectedSystem === 'tontrac' ? (
              <TontracDashboard tickets={tontracTickets} orders={tontracOrders} />
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
          const sys = systems[key] || { name: key, status: 'online', stream_url: '' };
          const isSelected = selectedSystem === key;
          const isOnline = sys.status === 'online';
          return (
            <button key={key} onClick={() => setSelectedSystem(key)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition duration-150 ${isSelected ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
              <div className="flex items-center">
                <span className={`mr-3 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`}>{getSystemIcon(key)}</span>
                <div className="text-left">
                  <span className="font-display uppercase tracking-wider text-xs block">{sys.name}</span>
                </div>
              </div>
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'}`}></span>
            </button>
          );
        })}
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

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center shrink-0 z-10">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-800 uppercase font-display">{system.name} Stream Mirror</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onReconnect} className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition">
            <Icons.Refresh /><span>Reconnect</span>
          </button>
          <button onClick={onConfigClick} className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition">
            <Icons.Settings /><span>Source</span>
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-[#020508]">
        {streamMode === 'hls' && <HLSPlayer url={system.stream_url} systemName={system.name} />}
        {streamMode === 'iframe' && <IframePlayer url={system.stream_url} systemName={system.name} />}
      </div>
    </div>
  );
};

// ─── OVERVIEW DASHBOARD ──────────────────────────────────────
const OverviewDashboard = ({ systems, alerts, aiAnalysis, setSelectedSystem }) => {
  const keys = Object.keys(systems);
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {keys.map((key) => {
          const sys = systems[key];
          if (!sys) return null;
          return (
            <div key={key} onClick={() => setSelectedSystem(key)} className="glass-panel p-5 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition">
              <h4 className="font-semibold text-gray-800 text-sm uppercase font-display">{sys.name}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── RIGHT PANEL ─────────────────────────────────────────────
const RightPanel = ({ activeTab, setActiveTab, alerts, aiAnalysis, activityFeed, selectedSystem }) => {
  const fA = selectedSystem === 'overview' ? alerts : alerts.filter(a => a.system_id === selectedSystem);
  const tc = (t) => `py-3.5 text-xs font-semibold tracking-wide border-b-2 transition font-display uppercase ${activeTab === t ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60' : 'border-transparent text-gray-500 hover:text-gray-800'}`;
  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full shrink-0">
      <div className="grid grid-cols-3 border-b border-gray-200 shrink-0">
        <button onClick={() => setActiveTab('alerts')} className={tc('alerts')}>Alerts</button>
        <button onClick={() => setActiveTab('analysis')} className={tc('analysis')}>AI Analysis</button>
        <button onClick={() => setActiveTab('activity')} className={tc('activity')}>Activity</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'alerts' && fA.map(a => (
          <div key={a.id} className="p-3 rounded border text-xs bg-red-50 text-red-700">{a.message}</div>
        ))}
      </div>
    </div>
  );
};

// ─── CONFIG MODAL ─────────────────────────────────────────────
const ConfigModal = ({ system, onClose, onSave }) => {
  const [streamType, setStreamType] = React.useState(system.stream_type);
  const [streamUrl, setStreamUrl] = React.useState(system.stream_url);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-lg overflow-hidden border border-gray-200 shadow-2xl p-6 space-y-4">
        <h3 className="text-base font-bold font-display uppercase">Source Setup: {system.name}</h3>
        <input type="text" value={streamUrl} onChange={e => setStreamUrl(e.target.value)} className="w-full border rounded px-3 py-2 text-sm font-mono" />
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded text-xs bg-gray-100">Cancel</button>
          <button onClick={() => onSave(streamType, streamUrl)} className="px-4 py-2 rounded text-xs bg-emerald-600 text-white">Save</button>
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