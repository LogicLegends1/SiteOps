import os
import logging
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SiteOps Python Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    supabase: Client = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)


@app.on_event("startup")
async def startup_event():
    logger.info("Python ML Engine starting...")


@app.get("/predict/shortage/all/{project_id}")
async def get_all_material_forecasts(project_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    inventory_res = supabase.table("project_material_inventory")\
        .select("*, material_catalog(*)")\
        .eq("projectid", project_id)\
        .execute()
        
    if not inventory_res.data: return []

    activities_res = supabase.table("activity").select("activityid").eq("projectid", project_id).execute()
    activity_ids = [act["activityid"] for act in activities_res.data] if activities_res.data else []

    results = []
    fourteen_days_ago = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")

    # FIX: N+1 Query Bottleneck
    # Fetch ALL consumption logs for the project in 1 single query
    all_logs = []
    if activity_ids:
        all_logs_db = supabase.table("material_consumption_log")\
            .select("materialid, quantityused, daterecorded")\
            .in_("activityid", activity_ids)\
            .gte("daterecorded", fourteen_days_ago)\
            .execute()
        all_logs = all_logs_db.data or []

    # Group logs by materialid locally in Python memory
    logs_by_material = {}
    for log in all_logs:
        m_id = log["materialid"]
        if m_id not in logs_by_material:
            logs_by_material[m_id] = []
        logs_by_material[m_id].append(log)

    for item in inventory_res.data:
        mat = item.get("material_catalog")
        if not mat: continue
            
        mat_id = mat["materialid"]
        total_allocated = float(item["allocatedstock"])

        # Fetch from local memory dictionary instead of hitting the database
        logs_res = logs_by_material.get(mat_id, [])

        total_consumed = sum(float(l["quantityused"]) for l in logs_res)
        unique_days = len(set(l["daterecorded"] for l in logs_res))
        
        daily_burn_rate = (total_consumed / unique_days) if unique_days > 0 else 0
        available_stock = total_allocated - total_consumed
        
        days_rem = (available_stock / daily_burn_rate) if daily_burn_rate > 0 else None
        
        stock_level = "adequate"
        if days_rem is not None:
            if days_rem <= 5: stock_level = "critical"
            elif days_rem <= 15: stock_level = "low"

        results.append({
            "id": str(mat_id),
            "name": mat["name"],
            "category": mat["category"],
            "unit": mat["unit"].lower(),
            "totalStock": total_allocated,
            "allocated": total_allocated,
            "consumed": total_consumed,
            "available": available_stock,
            "dailyAvgConsumption": round(daily_burn_rate, 1),
            "daysUntilShortage": round(days_rem) if days_rem is not None else 999,
            "stockLevel": stock_level,
            "consumptionTrend": "stable" # simplification for now
        })
        
    return results


@app.get("/predict/alerts/{project_id}")
async def get_alerts(project_id: int):
    # Leverage the existing forecast logic to auto-generate alerts
    materials = await get_all_material_forecasts(project_id)
    alerts = []
    
    for mat in materials:
        if mat["stockLevel"] == "critical":
            alerts.append({
                "id": f"ALERT-CRIT-{mat['id']}",
                "materialId": mat['id'],
                "materialName": mat['name'],
                "type": "critical_stock",
                "severity": "critical",
                "message": f"{mat['name']} stock critically low. Only {mat['daysUntilShortage']} days of supply remaining.",
                "recommendation": "Place emergency order immediately. Consider alternative suppliers.",
                "affectedActivities": ["High Priority Tasks"], 
                "createdAt": datetime.now().isoformat() + "Z",
                "acknowledged": False
            })
        elif mat["stockLevel"] == "low":
            alerts.append({
                "id": f"ALERT-LOW-{mat['id']}",
                "materialId": mat['id'],
                "materialName": mat['name'],
                "type": "low_stock",
                "severity": "medium",
                "message": f"{mat['name']} approaching reorder level. {mat['daysUntilShortage']} days remaining.",
                "recommendation": "Schedule reorder within next 3 days.",
                "affectedActivities": [],
                "createdAt": datetime.now().isoformat() + "Z",
                "acknowledged": False
            })
            
    return alerts


@app.get("/predict/trend/{project_id}/{material_id}")
async def get_trend(project_id: int, material_id: int):
    # Fetch 7 days of logs to draw the graph
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    logs = supabase.table("material_consumption_log")\
        .select("quantityused, daterecorded")\
        .eq("materialid", material_id)\
        .gte("daterecorded", seven_days_ago)\
        .execute()
        
    data = logs.data or []
    grouped = {}
    for l in data:
        dt = l["daterecorded"]
        grouped[dt] = grouped.get(dt, 0) + float(l["quantityused"])
        
    trends = []
    for i in range(7):
        d = (datetime.now() - timedelta(days=6-i)).strftime("%Y-%m-%d")
        actual = grouped.get(d, 0)
        
        # ML placeholder: "planned" vs true "actual"
        # If no actual, we assume planned is some moving average (set to 5 for mock visual)
        planned = actual * 0.9 if actual > 0 else 5
        
        trends.append({
            "date": d,
            "actual": actual,
            "planned": round(planned, 1)
        })
        
    return trends


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
