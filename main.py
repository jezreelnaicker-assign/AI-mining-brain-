import asyncio
import random
import os
import json
import time
import asyncpg
import httpx
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, Response
from pydantic import BaseModel
from typing import Any
from fastapi import Body

app = FastAPI(title="AI Operations Command Center Backend")

# Render's server runs in UTC. All timestamps shown on the dashboard
# should be South Africa time (SAST, UTC+2, no daylight saving) --
# this helper is used everywhere instead of bare datetime.now().
def sast_now():
    return datetime.now(ZoneInfo("Africa/Johannesburg"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = os.path.dirname(__file__)
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
TONTRAC_TICKETS = []
TONTRAC_ORDERS = []

# ==========================================================
# PERSISTENT STORAGE (Neon Postgres, free tier)
# TONTRAC_TICKETS / TONTRAC_ORDERS above stay as fast in-memory
# caches for the websocket/API, but every record is also written
# to the database so it survives redeploys and restarts. On
# startup, recent history is reloaded from the database back into
# these in-memory lists.
# ==========================================================
DB_POOL = None


async def init_db():
    global DB_POOL
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("WARNING: DATABASE_URL not set -- tontrac data will NOT persist across restarts.")
        return

    async def init_connection(conn):
        # Without this, asyncpg returns JSONB columns as raw text
        # strings instead of decoded Python objects -- this was
        # causing tickets/orders reloaded after a restart to show
        # up with every field "undefined" on the dashboard.
        await conn.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
            format="text",
        )

    DB_POOL = await asyncpg.create_pool(database_url, min_size=1, max_size=5, init=init_connection)

    async with DB_POOL.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS tontrac_tickets (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL,
                received_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS tontrac_orders (
                id SERIAL PRIMARY KEY,
                data JSONB NOT NULL,
                received_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        """)

        # Rehydrate in-memory caches from the database (most recent first)
        ticket_rows = await conn.fetch("SELECT data FROM tontrac_tickets ORDER BY id DESC LIMIT 200")
        TONTRAC_TICKETS[:] = [row["data"] for row in ticket_rows]

        order_rows = await conn.fetch("SELECT data FROM tontrac_orders ORDER BY id DESC LIMIT 200")
        TONTRAC_ORDERS[:] = [row["data"] for row in order_rows]

    print(f"DB connected. Loaded {len(TONTRAC_TICKETS)} tickets, {len(TONTRAC_ORDERS)} orders from storage.")


async def save_tickets_to_db(tickets):
    if not DB_POOL:
        return
    async with DB_POOL.acquire() as conn:
        await conn.executemany(
            "INSERT INTO tontrac_tickets (data) VALUES ($1::jsonb)",
            [(json.dumps(t),) for t in tickets]
        )


async def save_orders_to_db(orders):
    if not DB_POOL:
        return
    async with DB_POOL.acquire() as conn:
        await conn.executemany(
            "INSERT INTO tontrac_orders (data) VALUES ($1::jsonb)",
            [(json.dumps(o),) for o in orders]
        )


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
            "activity_feed": ACTIVITY_FEED[-50:],
            "tontrac_tickets": TONTRAC_TICKETS[-100:],
            "tontrac_orders": TONTRAC_ORDERS[-100:]
        })


manager = ConnectionManager()


def add_alert(system_id: str, severity: str, message: str):
    alert = {
        "id": f"alert_{int(sast_now().timestamp()*1000)}",
        "timestamp": sast_now().strftime("%H:%M:%S"),
        "system_id": system_id,
        "system_name": SYSTEMS[system_id]["name"] if system_id in SYSTEMS else "System",
        "severity": severity,
        "message": message
    }
    ALERTS.append(alert)
    return alert


def add_ai_analysis(system_id: str, category: str, insight: str):
    analysis = {
        "id": f"analysis_{int(sast_now().timestamp()*1000)}",
        "timestamp": sast_now().strftime("%H:%M:%S"),
        "system_id": system_id,
        "system_name": SYSTEMS[system_id]["name"] if system_id in SYSTEMS else "System",
        "category": category,
        "insight": insight
    }
    AI_ANALYSIS.append(analysis)
    return analysis


def add_activity(system_id: str, message: str):
    activity = {
        "id": f"activity_{int(sast_now().timestamp()*1000)}",
        "timestamp": sast_now().strftime("%H:%M:%S"),
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
async def receive_tontrac_tickets(payload: Any = Body(...)):
    """
    Receive weighbridge tickets pushed from TonTrac.

    Supports:
    - Single ticket (JSON object)
    - Batch of tickets (JSON array)
    """

    try:

        # Support both a single ticket and a batch
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

        received_at = sast_now().strftime("%H:%M:%S")
        stored_tickets = []
        for ticket in tickets:
            print("------------------------------------------------------")
            print(f"Ticket No : {ticket.get('TicketNo')}")
            print(f"Order No  : {ticket.get('OrderNo')}")
            print(f"Vehicle   : {ticket.get('VehicleRegNo')}")
            print(f"Driver    : {ticket.get('DriverName')}")
            print(f"Product   : {ticket.get('ProductName')}")
            print(f"Net Weight: {ticket.get('NettWeightKgs')} kg")

            enriched = {**ticket, "_received_at": received_at}
            stored_tickets.append(enriched)

        print("=======================================================\n")

        # Store, trim to last 200, newest first
        TONTRAC_TICKETS[:0] = stored_tickets
        del TONTRAC_TICKETS[200:]

        # Persist to database so this survives redeploys/restarts
        await save_tickets_to_db(stored_tickets)

        # Push live to any connected dashboard
        await manager.broadcast({"type": "NEW_TONTRAC_TICKETS", "data": stored_tickets})

        # Reflect real activity on the Tontrac tile (replaces the old
        # simulated random numbers for this system)
        if "tontrac" in SYSTEMS:
            SYSTEMS["tontrac"]["metrics"]["dispatched"] = SYSTEMS["tontrac"]["metrics"].get("dispatched", 0) + len(stored_tickets)
            SYSTEMS["tontrac"]["metrics"]["last_ticket_at"] = received_at
            await manager.broadcast({"type": "SYSTEM_UPDATE", "system": SYSTEMS["tontrac"]})

        act = add_activity("tontrac", f"Received {len(stored_tickets)} weighbridge ticket(s) from TonTrac.")
        await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})

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


@app.get("/api/tontrac/tickets")
async def get_tontrac_tickets():
    return {"status": "success", "count": len(TONTRAC_TICKETS), "tickets": TONTRAC_TICKETS[:100]}


# ==========================================================
# TONTRAC ORDERS
# Receives orders pushed from TonTrac. Field names match the
# OrdersPayload.json schema TonTrac supplied.
# ==========================================================

@app.post("/api/tontrac/orders")
async def receive_tontrac_orders(payload: Any = Body(...)):
    """
    Receive orders pushed from TonTrac.

    Supports:
    - Single order (JSON object)
    - Batch of orders (JSON array)
    """

    try:

        # Support both a single order and a batch
        if isinstance(payload, dict):
            orders = [payload]
        elif isinstance(payload, list):
            orders = payload
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Invalid JSON payload."
                }
            )

        print("\n================ TONTRAC ORDERS PUSH RECEIVED ================")
        print(f"Orders Received: {len(orders)}")

        received_at = sast_now().strftime("%H:%M:%S")
        stored_orders = []
        for order in orders:
            print("------------------------------------------------------")
            print(f"Order No     : {order.get('OrderNo')}")
            print(f"Order Ref No : {order.get('OrderRefNo')}")
            print(f"Order Type   : {order.get('OrderType')}")
            print(f"Order Date   : {order.get('OrderDate')}")
            print(f"Product      : {order.get('ProductName')} ({order.get('ProductReference')})")
            print(f"Dispatch     : {order.get('DispatchOrganisationName')} / {order.get('DispatchLocationName')}")
            print(f"Receipt      : {order.get('ReceiptOrganisationName')} / {order.get('ReceiptLocationName')}")
            print(f"Est. Mass    : {order.get('EstimatedMass')}")
            print(f"Completed On : {order.get('CompletedOn')}  Mass: {order.get('CompletedOnMass')}")
            print(f"Status       : IsComplete={order.get('IsComplete')} IsOpen={order.get('IsOpen')} IsSuspended={order.get('IsSuspended')}")

            enriched = {**order, "_received_at": received_at}
            stored_orders.append(enriched)

        print("=======================================================\n")

        # Store, trim to last 200, newest first
        TONTRAC_ORDERS[:0] = stored_orders
        del TONTRAC_ORDERS[200:]

        # Persist to database so this survives redeploys/restarts
        await save_orders_to_db(stored_orders)

        await manager.broadcast({"type": "NEW_TONTRAC_ORDERS", "data": stored_orders})

        if "tontrac" in SYSTEMS:
            SYSTEMS["tontrac"]["metrics"]["last_order_at"] = received_at
            await manager.broadcast({"type": "SYSTEM_UPDATE", "system": SYSTEMS["tontrac"]})

        act = add_activity("tontrac", f"Received {len(stored_orders)} order(s) from TonTrac.")
        await manager.broadcast({"type": "NEW_ACTIVITY", "data": act})

        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "TonTrac orders received successfully.",
                "received": len(orders)
            }
        )

    except Exception as ex:
        print(f"TonTrac Orders Endpoint Error: {ex}")

        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(ex)
            }
        )


@app.get("/api/tontrac/orders")
async def get_tontrac_orders():
    return {"status": "success", "count": len(TONTRAC_ORDERS), "orders": TONTRAC_ORDERS[:100]}

# ==========================================================
# CCTV camera stream directory.
#
# TUNNEL_BASE is the ONLY thing you should need to change when
# the Cloudflare quick-tunnel URL changes (which happens every
# time cloudflared is restarted, since these free quick tunnels
# don't have a fixed address). Every camera URL below is built
# from this one variable.
# ==========================================================
TUNNEL_BASE = "https://laptop-17setviq.tail7acde1.ts.net"

@app.get("/api/cameras/streams")
async def get_camera_streams():
    cameras = [
        # --- Bultfontein Site ---
        {"id": "bult-wb", "site": "BULTFONTEIN", "name": "PUC M4 WEIGHBRIDGE B", "ip": "10.8.16.16", "url": f"{TUNNEL_BASE}/cam1/index.m3u8"},
        {"id": "bult-nvr01", "site": "BULTFONTEIN", "name": "PUC NVR01", "ip": "10.8.0.201", "url": f"{TUNNEL_BASE}/puc_nvr01/index.m3u8"},
        {"id": "bult-nvr02", "site": "BULTFONTEIN", "name": "PUC NVR02", "ip": "10.8.0.202", "url": f"{TUNNEL_BASE}/puc_nvr02/index.m3u8"},
        {"id": "bult-mhs-vf", "site": "BULTFONTEIN", "name": "PUC MHS VF", "ip": "10.8.2.1", "url": f"{TUNNEL_BASE}/puc_mhs_vf/index.m3u8"},
        {"id": "bult-mhs-ptz", "site": "BULTFONTEIN", "name": "PUC MHS PTZ", "ip": "10.8.2.2", "url": f"{TUNNEL_BASE}/puc_mhs_ptz/index.m3u8"},
        {"id": "bult-m1-d", "site": "BULTFONTEIN", "name": "PUC M1 D", "ip": "10.8.1.1", "url": f"{TUNNEL_BASE}/puc_m1_d/index.m3u8"},
        {"id": "bult-m1-vf-l", "site": "BULTFONTEIN", "name": "PUC M1 VF L", "ip": "10.8.1.2", "url": f"{TUNNEL_BASE}/puc_m1_vf_l/index.m3u8"},
        {"id": "bult-m1-vf-r", "site": "BULTFONTEIN", "name": "PUC M1 VF R", "ip": "10.8.1.3", "url": f"{TUNNEL_BASE}/puc_m1_vf_r/index.m3u8"},
        {"id": "bult-m1-npr-l", "site": "BULTFONTEIN", "name": "PUC M1 NPR L", "ip": "10.8.1.4", "url": f"{TUNNEL_BASE}/puc_m1_npr_l/index.m3u8"},
        {"id": "bult-m1-npr-r", "site": "BULTFONTEIN", "name": "PUC M1 NPR R", "ip": "10.8.1.5", "url": f"{TUNNEL_BASE}/puc_m1_npr_r/index.m3u8"},
        {"id": "bult-m2-d", "site": "BULTFONTEIN", "name": "PUC M2 D", "ip": "10.8.1.6", "url": f"{TUNNEL_BASE}/puc_m2_d/index.m3u8"},
        {"id": "bult-m2-vf-l", "site": "BULTFONTEIN", "name": "PUC M2 VF L", "ip": "10.8.1.7", "url": f"{TUNNEL_BASE}/puc_m2_vf_l/index.m3u8"},
        {"id": "bult-m2-vf-r", "site": "BULTFONTEIN", "name": "PUC M2 VF R", "ip": "10.8.1.8", "url": f"{TUNNEL_BASE}/puc_m2_vf_r/index.m3u8"},
        {"id": "bult-m2-npr-l", "site": "BULTFONTEIN", "name": "PUC M2 NPR L", "ip": "10.8.1.9", "url": f"{TUNNEL_BASE}/puc_m2_npr_l/index.m3u8"},
        {"id": "bult-m2-npr-r", "site": "BULTFONTEIN", "name": "PUC M2 NPR R", "ip": "10.8.1.10", "url": f"{TUNNEL_BASE}/puc_m2_npr_r/index.m3u8"},
        {"id": "bult-m3-d", "site": "BULTFONTEIN", "name": "PUC M3 D", "ip": "10.8.1.11", "url": f"{TUNNEL_BASE}/puc_m3_d/index.m3u8"},
        {"id": "bult-m3-vf-l", "site": "BULTFONTEIN", "name": "PUC M3 VF L", "ip": "10.8.1.12", "url": f"{TUNNEL_BASE}/puc_m3_vf_l/index.m3u8"},
        {"id": "bult-m3-vf-r", "site": "BULTFONTEIN", "name": "PUC M3 VF R", "ip": "10.8.1.13", "url": f"{TUNNEL_BASE}/puc_m3_vf_r/index.m3u8"},
        {"id": "bult-m3-npr-l", "site": "BULTFONTEIN", "name": "PUC M3 NPR L", "ip": "10.8.1.14", "url": f"{TUNNEL_BASE}/puc_m3_npr_l/index.m3u8"},
        {"id": "bult-m4-d", "site": "BULTFONTEIN", "name": "PUC M4 D", "ip": "10.8.1.16", "url": f"{TUNNEL_BASE}/puc_m4_d/index.m3u8"},
        {"id": "bult-m4-wb", "site": "BULTFONTEIN", "name": "PUC M4 WEIGHBRIDGE B", "ip": "10.8.16.16", "url": f"{TUNNEL_BASE}/puc_m4_weighbridge_b/index.m3u8"},
        {"id": "bult-m4-vf-l", "site": "BULTFONTEIN", "name": "PUC M4 VF L", "ip": "10.8.1.17", "url": f"{TUNNEL_BASE}/puc_m4_vf_l/index.m3u8"},
        {"id": "bult-m4-vf-r", "site": "BULTFONTEIN", "name": "PUC M4 VF R", "ip": "10.8.1.18", "url": f"{TUNNEL_BASE}/puc_m4_vf_r/index.m3u8"},
        {"id": "bult-m4-npr-l", "site": "BULTFONTEIN", "name": "PUC M4 NPR L", "ip": "10.8.1.19", "url": f"{TUNNEL_BASE}/puc_m4_npr_l/index.m3u8"},
        {"id": "bult-m5-d", "site": "BULTFONTEIN", "name": "PUC M5 D", "ip": "10.8.1.21", "url": f"{TUNNEL_BASE}/puc_m5_d/index.m3u8"},
        {"id": "bult-m5-ptz", "site": "BULTFONTEIN", "name": "PUC M5 PTZ", "ip": "10.8.1.25", "url": f"{TUNNEL_BASE}/puc_m5_ptz/index.m3u8"},
        {"id": "bult-m6-d", "site": "BULTFONTEIN", "name": "PUC M6 D", "ip": "10.8.1.26", "url": f"{TUNNEL_BASE}/puc_m6_d/index.m3u8"},
        {"id": "bult-m6-vf-l", "site": "BULTFONTEIN", "name": "PUC M6 VF L", "ip": "10.8.1.27", "url": f"{TUNNEL_BASE}/puc_m6_vf_l/index.m3u8"},
        {"id": "bult-m6-vf-r", "site": "BULTFONTEIN", "name": "PUC M6 VF R", "ip": "10.8.1.28", "url": f"{TUNNEL_BASE}/puc_m6_vf_r/index.m3u8"},
        {"id": "bult-m6-npr-l", "site": "BULTFONTEIN", "name": "PUC M6 NPR L", "ip": "10.8.1.29", "url": f"{TUNNEL_BASE}/puc_m6_npr_l/index.m3u8"},
        {"id": "bult-m7-d", "site": "BULTFONTEIN", "name": "PUC M7 D", "ip": "10.8.1.31", "url": f"{TUNNEL_BASE}/puc_m7_d/index.m3u8"},
        {"id": "bult-m7-lptz", "site": "BULTFONTEIN", "name": "PUC M7 LPTZ", "ip": "10.8.1.35", "url": f"{TUNNEL_BASE}/puc_m7_lptz/index.m3u8"},
        {"id": "bult-m8-d", "site": "BULTFONTEIN", "name": "PUC M8 D", "ip": "10.8.1.36", "url": f"{TUNNEL_BASE}/puc_m8_d/index.m3u8"},
        {"id": "bult-m8-lptz", "site": "BULTFONTEIN", "name": "PUC M8 LPTZ", "ip": "10.8.1.40", "url": f"{TUNNEL_BASE}/puc_m8_lptz/index.m3u8"},
        {"id": "bult-m9-d", "site": "BULTFONTEIN", "name": "PUC M9 D", "ip": "10.8.1.41", "url": f"{TUNNEL_BASE}/puc_m9_d/index.m3u8"},
        {"id": "bult-m9-lptz", "site": "BULTFONTEIN", "name": "PUC M9 LPTZ", "ip": "10.8.1.45", "url": f"{TUNNEL_BASE}/puc_m9_lptz/index.m3u8"},
        {"id": "bult-m10-d", "site": "BULTFONTEIN", "name": "PUC M10 D", "ip": "10.8.1.46", "url": f"{TUNNEL_BASE}/puc_m10_d/index.m3u8"},
        {"id": "bult-m10-lptz", "site": "BULTFONTEIN", "name": "PUC M10 LPTZ", "ip": "10.8.1.50", "url": f"{TUNNEL_BASE}/puc_m10_lptz/index.m3u8"},

        # --- Annelize Site ---
        {"id": "annelize-nvr", "site": "ANNELIZE", "name": "PMT OFFICE NVR", "ip": "10.16.0.201", "url": f"{TUNNEL_BASE}/pmt_office_nvr/index.m3u8"},
        {"id": "annelize-ptz", "site": "ANNELIZE", "name": "PMT OFFICE PTZ", "ip": "10.16.1.3", "url": f"{TUNNEL_BASE}/pmt_office_ptz/index.m3u8"},
        {"id": "annelize-m1-b1", "site": "ANNELIZE", "name": "PMT M1 B1", "ip": "10.16.1.11", "url": f"{TUNNEL_BASE}/pmt_m1_b1/index.m3u8"},
        {"id": "annelize-m1-ptz", "site": "ANNELIZE", "name": "PMT M1 PTZ", "ip": "10.16.1.12", "url": f"{TUNNEL_BASE}/pmt_m1_ptz/index.m3u8"},
        {"id": "annelize-m1-b2", "site": "ANNELIZE", "name": "PMT M1 B2", "ip": "10.16.1.13", "url": f"{TUNNEL_BASE}/pmt_m1_b2/index.m3u8"},
        {"id": "annelize-m2-b1", "site": "ANNELIZE", "name": "PMT M2 B1", "ip": "10.16.1.16", "url": f"{TUNNEL_BASE}/pmt_m2_b1/index.m3u8"},
        {"id": "annelize-m2-b2", "site": "ANNELIZE", "name": "PMT M2 B2", "ip": "10.16.1.17", "url": f"{TUNNEL_BASE}/pmt_m2_b2/index.m3u8"},
        {"id": "annelize-m2-b3", "site": "ANNELIZE", "name": "PMT M2 B3", "ip": "10.16.1.18", "url": f"{TUNNEL_BASE}/pmt_m2_b3/index.m3u8"},
        {"id": "annelize-m2-b4", "site": "ANNELIZE", "name": "PMT M2 B4", "ip": "10.16.1.19", "url": f"{TUNNEL_BASE}/pmt_m2_b4/index.m3u8"}
    ]
    return {"status": "success", "count": len(cameras), "cameras": cameras}

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
                await websocket.send_json({"type": "PONG", "timestamp": sast_now().strftime("%H:%M:%S")})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


async def simulation_loop():
    print("Background Simulation Loop Started...")
    while True:
        await asyncio.sleep(random.uniform(8.0, 15.0))
        sys_id = random.choice([k for k in SYSTEMS.keys() if k != "tontrac"])
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


# ==========================================================
# SATELLITE SURVEILLANCE — Copernicus Sentinel-2
#
# Free imagery source, chosen after comparing against Landsat and
# NASA Worldview/HLS: best balance of resolution (10m), revisit
# frequency (~5 days), a real programmatic API (not just a
# download portal), free commercial use, and native AOI/polygon
# support. See chat for the full comparison.
#
# ARCHITECTURE NOTE: every function below is written against one
# clean interface (get_latest_scene_meta, get_scene_image,
# search_recent_scenes). To later swap in commercial high-res
# imagery or drone photogrammetry, add a new module implementing
# the same three functions and switch which one the endpoints
# call -- nothing on the frontend needs to change.
#
# Credentials: COPERNICUS_CLIENT_ID / COPERNICUS_CLIENT_SECRET
# env vars (Sentinel Hub Dashboard -> User Settings -> OAuth
# clients). Never hardcoded.
# ==========================================================

COPERNICUS_TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
COPERNICUS_PROCESS_URL = "https://sh.dataspace.copernicus.eu/process/v1"
COPERNICUS_CATALOG_URL = "https://sh.dataspace.copernicus.eu/catalog/v1/search"

# Bultfontein Mine AOI -- built as a ~3km x 3km box around the
# coordinates provided (lat -28.76788, lng 24.79387). Adjust if a
# more precise mine boundary/polygon becomes available later.
SITE_AOIS = {
    "bultfontein": {
        "name": "Bultfontein Mine",
        "center": {"lat": -28.76788, "lng": 24.79387},
        # [west, south, east, north] in WGS84
        "bbox": [24.77887, -28.78288, 24.80887, -28.75288],
    }
}

TRUE_COLOR_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: ["B02", "B03", "B04"],
    output: { bands: 3, sampleType: "AUTO" }
  }
}
function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02]
}
"""

_copernicus_token = {"value": None, "expires_at": 0}


async def _get_copernicus_token():
    """Client-credentials OAuth token, cached until shortly before it expires."""
    if _copernicus_token["value"] and time.time() < _copernicus_token["expires_at"] - 60:
        return _copernicus_token["value"]

    client_id = os.environ.get("COPERNICUS_CLIENT_ID")
    client_secret = os.environ.get("COPERNICUS_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise RuntimeError("COPERNICUS_CLIENT_ID / COPERNICUS_CLIENT_SECRET not set")

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            COPERNICUS_TOKEN_URL,
            data={"grant_type": "client_credentials", "client_id": client_id, "client_secret": client_secret},
        )
        resp.raise_for_status()
        data = resp.json()

    _copernicus_token["value"] = data["access_token"]
    _copernicus_token["expires_at"] = time.time() + data.get("expires_in", 3600)
    return _copernicus_token["value"]


async def search_recent_scenes(site_id: str, days: int = 90, limit: int = 20):
    """Returns a list of {date, cloud_coverage} for available scenes, most recent first."""
    aoi = SITE_AOIS[site_id]
    token = await _get_copernicus_token()

    from datetime import timedelta
    end = datetime.utcnow()
    start = end - timedelta(days=days)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            COPERNICUS_CATALOG_URL,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "collections": ["sentinel-2-l2a"],
                "datetime": f"{start.strftime('%Y-%m-%dT00:00:00Z')}/{end.strftime('%Y-%m-%dT23:59:59Z')}",
                "bbox": aoi["bbox"],
                "limit": limit,
                "sortby": [{"field": "properties.datetime", "direction": "desc"}],
            },
        )
        resp.raise_for_status()
        data = resp.json()

    scenes = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        acquisition_datetime = props.get("datetime", "")
        scenes.append({
            "date": acquisition_datetime[:10] if acquisition_datetime else None,
            "cloud_coverage": props.get("eo:cloud_cover"),
        })
    return scenes


async def get_scene_image(site_id: str, date: str) -> bytes:
    """Returns a true-color JPEG for the given site/date (YYYY-MM-DD)."""
    aoi = SITE_AOIS[site_id]
    token = await _get_copernicus_token()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            COPERNICUS_PROCESS_URL,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "input": {
                    "bounds": {
                        "bbox": aoi["bbox"],
                        "properties": {"crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"},
                    },
                    "data": [{
                        "type": "sentinel-2-l2a",
                        "dataFilter": {
                            "timeRange": {"from": f"{date}T00:00:00Z", "to": f"{date}T23:59:59Z"},
                            "mosaickingOrder": "leastCC",
                        },
                    }],
                },
                "output": {
                    "width": 800,
                    "height": 800,
                    "responses": [{"identifier": "default", "format": {"type": "image/jpeg"}}],
                },
                "evalscript": TRUE_COLOR_EVALSCRIPT,
            },
        )
        resp.raise_for_status()
        return resp.content


async def get_latest_scene_meta(site_id: str):
    scenes = await search_recent_scenes(site_id, days=30, limit=5)
    if not scenes:
        return None
    return scenes[0]


@app.get("/api/satellite/{site_id}/latest-meta")
async def satellite_latest_meta(site_id: str):
    if site_id not in SITE_AOIS:
        return JSONResponse(status_code=404, content={"status": "error", "message": "Unknown site"})
    try:
        meta = await get_latest_scene_meta(site_id)
        if not meta:
            return {"status": "success", "meta": None, "message": "No recent cloud-free scenes found"}
        return {
            "status": "success",
            "meta": meta,
            "site_name": SITE_AOIS[site_id]["name"],
            "center": SITE_AOIS[site_id]["center"],
        }
    except Exception as ex:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(ex)})


@app.get("/api/satellite/{site_id}/history")
async def satellite_history(site_id: str, days: int = 90):
    if site_id not in SITE_AOIS:
        return JSONResponse(status_code=404, content={"status": "error", "message": "Unknown site"})
    try:
        scenes = await search_recent_scenes(site_id, days=days, limit=30)
        return {"status": "success", "scenes": scenes}
    except Exception as ex:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(ex)})


@app.get("/api/satellite/{site_id}/image")
async def satellite_image(site_id: str, date: str):
    if site_id not in SITE_AOIS:
        return JSONResponse(status_code=404, content={"status": "error", "message": "Unknown site"})
    try:
        image_bytes = await get_scene_image(site_id, date)
        return Response(content=image_bytes, media_type="image/jpeg")
    except Exception as ex:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(ex)})


@app.on_event("startup")
async def startup_event():
    await init_db()
    asyncio.create_task(simulation_loop())