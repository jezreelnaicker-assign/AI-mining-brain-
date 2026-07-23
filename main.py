import asyncio
import random
import os
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

app = FastAPI(title="AI Operations Command Center Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    index_path = os.path.join(frontend_path, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        return f.read()

# In-memory state
SYSTEMS = {
    "abcotronics": {
        "id": "abcotronics",
        "name": "Abcotronics",
        "status": "online",
        "stream_type": "OBS Stream",
        "stream_url": "obs://192.168.1.100/abcotronics_main",
        "metrics": {"throughput": 85.4, "temp": 42.1, "efficiency": 94.2},
    },
    "tontrac": {
        "id": "tontrac",
        "name": "Tontrac",
        "status": "online",
        "stream_type": "Browser Dashboard",
        "stream_url": "https://dash.tontrac.internal/ops",
        "metrics": {"active_jobs": 12, "dispatched": 142, "delayed": 1},
    },
    "weighbridge_camera": {
        "id": "weighbridge_camera",
        "name": "Weighbridge Camera",
        "status": "online",
        "stream_type": "Camera Feed",
        "stream_url": "rtsp://admin:admin123@192.168.1.200/stream1",
        "metrics": {"daily_trucks": 84, "queue_length": 2, "last_ocr": "CA 852-964"},
    },
    "nimbus": {
        "id": "nimbus",
        "name": "Nimbus",
        "status": "online",
        "stream_type": "WebRTC Stream",
        "stream_url": "webrtc://nimbus.cloud/live/stream",
        "metrics": {"cpu_load": 48.2, "memory_usage": 67.5, "latency_ms": 24},
    },
    "sde": {
        "id": "sde",
        "name": "SDE",
        "status": "online",
        "stream_type": "Remote Desktop Feed",
        "stream_url": "vnc://sde-workstation.internal:5900",
        "metrics": {"active_processes": 8, "errors_logged": 0, "commits_today": 14},
    },
    "bidtrack": {
        "id": "bidtrack",
        "name": "Bidtrack",
        "status": "online",
        "stream_type": "Browser Dashboard",
        "stream_url": "https://bidtrack.mining/live",
        "metrics": {"current_bids": 47, "avg_bid_value": 12450, "pending_deals": 3},
    },
}

ALERTS = []
AI_ANALYSIS = []
ACTIVITY_FEED = []


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.send_initial_state(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

    async def send_initial_state(self, websocket: WebSocket):
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "systems": SYSTEMS,
            "alerts": ALERTS[-50:],
            "ai_analysis": AI_ANALYSIS[-50:],
            "activity_feed": ACTIVITY_FEED[-50:]
        })


manager = ConnectionManager()


def add_alert(system_id: str, severity: str, message: str):
    alert = {
        "id": f"alert_{int(datetime.now().timestamp()*1000)}",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "system_id": system_id,
        "system_name": SYSTEMS[system_id]["name"] if system_id in SYSTEMS else "System",
        "severity": severity,
        "message": message
    }
    ALERTS.append(alert)
    return alert


def add_ai_analysis(system_id: str, category: str, insight: str):
    analysis = {
        "id": f"analysis_{int(datetime.now().timestamp()*1000)}",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "system_id": system_id,
        "system_name": SYSTEMS[system_id]["name"] if system_id in SYSTEMS else "System",
        "category": category,
        "insight": insight
    }
    AI_ANALYSIS.append(analysis)
    return analysis


def add_activity(system_id: str, message: str):
    activity = {
        "id": f"activity_{int(datetime.now().timestamp()*1000)}",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "system_id": system_id,
        "system_name": SYSTEMS[system_id]["name"] if system_id in SYSTEMS else "System",
        "message": message
    }
    ACTIVITY_FEED.append(activity)
    return activity


def seed_data():
    add_activity("abcotronics", "System initialization completed")
    add_ai_analysis("abcotronics", "efficiency", "Operating at optimal 94.2% efficiency.")
    add_activity("tontrac", "12 active dispatch jobs tracked")
    add_ai_analysis("tontrac", "high activity", "Dispatch volume normal for shift.")
    add_activity("weighbridge_camera", "Vehicle observed: CA 852-964")
    add_alert("weighbridge_camera", "info", "New vehicle detected: CA 852-964")
    add_ai_analysis("weighbridge_camera", "ocr", "Weighbridge occupancy cleared. Last transit duration: 42s.")
    add_activity("nimbus", "Nimbus Cloud instance status check: Normal")
    add_ai_analysis("nimbus", "efficiency", "Resource allocation optimized across all instances.")
    add_activity("sde", "Dev workspace active: 8 compiling processes running")
    add_activity("bidtrack", "Bid sync complete, 47 current active bids")
    add_ai_analysis("bidtrack", "high activity", "Bidding momentum stable. Average bid: $12,450.")


seed_data()


class SystemConfigUpdate(BaseModel):
    stream_type: str
    stream_url: str


class SystemStatusUpdate(BaseModel):
    status: str


@app.get("/api/systems")
def get_systems():
    return SYSTEMS


@app.get("/api/history")
def get_history():
    return {
        "alerts": ALERTS[-100:],
        "ai_analysis": AI_ANALYSIS[-100:],
        "activity_feed": ACTIVITY_FEED[-100:]
    }
# ==========================================================
# TONTRAC WEIGHBRIDGE API
# Receives weighbridge tickets pushed from TonTrac
# ==========================================================

@app.post("/api/tontrac/tickets")
async def receive_tontrac_tickets(request: Request):
    try:
        payload = await request.json()

        # Support both a single ticket and a batch of tickets
        if isinstance(payload, dict):
            tickets = [payload]
        elif isinstance(payload, list):
            tickets = payload
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Invalid JSON payload."
                }
            )

        print("\n================ TONTRAC PUSH RECEIVED ================")
        print(f"Tickets Received: {len(tickets)}")

        for ticket in tickets:
            print("------------------------------------------------------")
            print(f"Ticket No : {ticket.get('TicketNo')}")
            print(f"Order No  : {ticket.get('OrderNo')}")
            print(f"Vehicle   : {ticket.get('VehicleRegNo')}")
            print(f"Driver    : {ticket.get('DriverName')}")
            print(f"Product   : {ticket.get('ProductName')}")
            print(f"Net Weight: {ticket.get('NettWeightKgs')} kg")

        print("======================================================\n")

        # Future enhancements:
        # - Save to database
        # - Broadcast to dashboard
        # - Run AI analysis
        # - Generate alerts

        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "TonTrac tickets received successfully.",
                "received": len(tickets)
            }
        )

    except Exception as ex:
        print(f"TonTrac Endpoint Error: {ex}")

        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(ex)
            }
        )

@app.post("/api/systems/{system_id}/config")
async def update_system_config(system_id: str, config: SystemConfigUpdate):
    if system_id in SYSTEMS:
        SYSTEMS[system_id]["stream_type"] = config.stream_type
        SYSTEMS[system_id]["stream_url"] = config.stream_url
        await manager.broadcast({"type": "SYSTEM_UPDATE", "system": SYSTEMS[system_id]})
        act = add_activity(system_id, f"Configuration updated: {config.stream_type} source changed.")
        await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
        return SYSTEMS[system_id]
    return {"error": "System not found"}, 404


@app.post("/api/systems/{system_id}/status")
async def update_system_status(system_id: str, status_data: SystemStatusUpdate):
    if system_id in SYSTEMS:
        SYSTEMS[system_id]["status"] = status_data.status
        await manager.broadcast({"type": "SYSTEM_UPDATE", "system": SYSTEMS[system_id]})
        act = add_activity(system_id, f"System status changed to {status_data.status}")
        await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
        if status_data.status == "offline":
            alert = add_alert(system_id, "critical" if system_id == "weighbridge_camera" else "error", "System connection offline")
            await manager.broadcast({"type": "NEW_ALERT", "data": alert})
        else:
            alert = add_alert(system_id, "info", "System connection restored")
            await manager.broadcast({"type": "NEW_ALERT", "data": alert})
        return SYSTEMS[system_id]
    return {"error": "System not found"}, 404


@app.post("/api/systems/{system_id}/reconnect")
async def reconnect_system(system_id: str):
    if system_id in SYSTEMS:
        SYSTEMS[system_id]["status"] = "online"
        await manager.broadcast({"type": "SYSTEM_UPDATE", "system": SYSTEMS[system_id]})
        act = add_activity(system_id, "Reconnection request sent by operator.")
        await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
        await asyncio.sleep(1.0)
        alert = add_alert(system_id, "info", "Stream connection re-established successfully.")
        await manager.broadcast({"type": "NEW_ALERT", "data": alert})
        analysis = add_ai_analysis(system_id, "efficiency", "Feed sync complete. Stream latency 24ms.")
        await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis})
        return {"status": "success", "system": SYSTEMS[system_id]}
    return {"error": "System not found"}, 404


@app.post("/api/clear")
async def clear_logs():
    global ALERTS, AI_ANALYSIS, ACTIVITY_FEED
    ALERTS.clear()
    AI_ANALYSIS.clear()
    ACTIVITY_FEED.clear()
    await manager.broadcast({"type": "CLEAR_LOGS"})
    return {"status": "success"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "OPERATOR_PING":
                await websocket.send_json({"type": "PONG", "timestamp": datetime.now().strftime("%H:%M:%S")})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


async def simulation_loop():
    print("Background Simulation Loop Started...")
    while True:
        await asyncio.sleep(random.uniform(8.0, 15.0))
        sys_id = random.choice(list(SYSTEMS.keys()))
        system = SYSTEMS[sys_id]

        if system["status"] == "offline":
            if random.random() > 0.5:
                system["status"] = "online"
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, "System re-established connection automatically.")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
                alert = add_alert(sys_id, "info", "Connection auto-restored.")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})
            continue

        event_roll = random.random()

        if sys_id == "abcotronics":
            if event_roll < 0.2:
                system["metrics"]["efficiency"] = round(random.uniform(70.0, 80.0), 1)
                system["metrics"]["temp"] = round(random.uniform(55.0, 65.0), 1)
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                alert = add_alert(sys_id, "warning", "Abcotronics thermal threshold warning: Temperature high.")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})
                analysis = add_ai_analysis(sys_id, "bottleneck", "High core temperature detected. Cooling sub-system response initiated.")
                await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis})
            elif event_roll < 0.4:
                system["metrics"]["throughput"] = round(random.uniform(80.0, 95.0), 1)
                system["metrics"]["efficiency"] = round(random.uniform(92.0, 98.0), 1)
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, f"Abcotronics telemetry update: throughput {system['metrics']['throughput']} t/h")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
            elif event_roll < 0.5:
                system["status"] = "offline"
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, "Abcotronics lost telemetry ping.")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
                alert = add_alert(sys_id, "error", "Abcotronics connection lost (Ping Timeout).")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})

        elif sys_id == "tontrac":
            if event_roll < 0.3:
                system["metrics"]["dispatched"] += 1
                system["metrics"]["active_jobs"] = max(1, system["metrics"]["active_jobs"] + random.choice([-1, 1]))
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, f"Tontrac vehicle dispatched. Job #{random.randint(4000, 4999)} started.")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
                analysis = add_ai_analysis(sys_id, "high activity", "Dispatch rate increased. Average cycle time: 14.8 minutes.")
                await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis})
            elif event_roll < 0.5:
                system["metrics"]["delayed"] += 1
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                alert = add_alert(sys_id, "warning", "Tontrac routing alert: Dispatch truck #42 delay at exit gate.")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})
                analysis = add_ai_analysis(sys_id, "bottleneck", "Queue build-up detected at exit gate. Bottleneck likely.")
                await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis})

        elif sys_id == "weighbridge_camera":
            if event_roll < 0.4:
                system["metrics"]["daily_trucks"] += 1
                queue = random.randint(1, 4)
                system["metrics"]["queue_length"] = queue
                letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=2))
                nums = "".join(random.choices("0123456789", k=3))
                letters2 = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3))
                plate = f"{letters} {nums}-{letters2}"
                system["metrics"]["last_ocr"] = plate
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, f"Truck arrived at weighbridge. License Plate: {plate}")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
                alert = add_alert(sys_id, "info", f"New vehicle detected at weighbridge: {plate}")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})
                analysis = add_ai_analysis(sys_id, "ocr", f"OCR identified registration {plate}. Weight verification in progress.")
                await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis})
                if queue >= 3:
                    alert_q = add_alert(sys_id, "warning", f"Weighbridge queue threshold reached: {queue} vehicles.")
                    await manager.broadcast({"type": "NEW_ALERT", "data": alert_q})
                    analysis_q = add_ai_analysis(sys_id, "queue", f"Weighbridge queue length is {queue}. Processing delay estimated at 12 mins.")
                    await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis_q})
            elif event_roll < 0.6:
                if system["metrics"]["queue_length"] > 0:
                    system["metrics"]["queue_length"] = max(0, system["metrics"]["queue_length"] - 1)
                    await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                    act = add_activity(sys_id, "Weighbridge cleared. Truck completed weighing.")
                    await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})

        elif sys_id == "nimbus":
            if event_roll < 0.3:
                system["metrics"]["cpu_load"] = round(random.uniform(82.0, 96.0), 1)
                system["metrics"]["latency_ms"] = random.randint(80, 150)
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                alert = add_alert(sys_id, "warning", f"Nimbus Resource Warning: CPU load spike ({system['metrics']['cpu_load']}%).")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})
                analysis = add_ai_analysis(sys_id, "bottleneck", "High load detected on main broker node. Processing speed impacted.")
                await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis})
            elif event_roll < 0.6:
                system["metrics"]["cpu_load"] = round(random.uniform(35.0, 55.0), 1)
                system["metrics"]["latency_ms"] = random.randint(15, 30)
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, "Nimbus cloud instance CPU load stabilized.")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})

        elif sys_id == "sde":
            if event_roll < 0.3:
                system["metrics"]["errors_logged"] += 1
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                alert = add_alert(sys_id, "error", "SDE deployment telemetry: Build compilation failure in service-mesh.")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})
                analysis = add_ai_analysis(sys_id, "bottleneck", "Integration pipeline blocked due to syntax check errors in release branch.")
                await manager.broadcast({"type": "NEW_AI_ANALYSIS", "data": analysis})
            elif event_roll < 0.6:
                system["metrics"]["commits_today"] += 1
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, "SDE Git repository update: New commit pushed by lead engineer.")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})

        elif sys_id == "bidtrack":
            if event_roll < 0.3:
                new_avg = round(system["metrics"]["avg_bid_value"] * random.uniform(1.02, 1.08), 2)
                system["metrics"]["avg_bid_value"] = int(new_avg)
                system["metrics"]["current_bids"] += 1
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, f"Bidtrack price action observed. Active bid count: {system['metrics']['current_bids']}.")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})
                alert = add_alert(sys_id, "info", f"High value transaction logged on Bidtrack. Avg bid now: ${system['metrics']['avg_bid_value']}.")
                await manager.broadcast({"type": "NEW_ALERT", "data": alert})
            elif event_roll < 0.5:
                system["metrics"]["pending_deals"] = max(0, system["metrics"]["pending_deals"] + random.choice([-1, 1]))
                await manager.broadcast({"type": "SYSTEM_UPDATE", "system": system})
                act = add_activity(sys_id, f"Bidtrack transaction status update: pending deals set to {system['metrics']['pending_deals']}.")
                await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())
