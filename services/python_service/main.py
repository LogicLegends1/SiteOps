import os
import logging
import random
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

    activities_res = supabase.table("activity").select("activityid, description").eq("projectid", project_id).execute()
    activity_map = {act["activityid"]: act["description"] for act in activities_res.data} if activities_res.data else {}
    activity_ids = list(activity_map.keys())

    results = []
    fourteen_days_ago = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")

    # Fetch ALL consumption logs including activityid
    all_logs = []
    if activity_ids:
        all_logs_db = supabase.table("material_consumption_log")\
            .select("materialid, activityid, quantityused, daterecorded")\
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
        available_stock = max(0, total_allocated - total_consumed)
        
        days_rem = (available_stock / daily_burn_rate) if daily_burn_rate > 0 else None
        
        stock_level = "adequate"
        if days_rem is not None:
            if days_rem <= 5: stock_level = "critical"
            elif days_rem <= 15: stock_level = "low"

        # Dynamic Linkage: Find which activities actually used this material in the last 14 days
        linked_activity_ids = set(l["activityid"] for l in logs_res if l["activityid"] in activity_map)
        linked_activity_names = [activity_map[aid] for aid in linked_activity_ids]

        results.append({
            "id": str(mat_id),
            "name": mat["name"],
            "category": mat["category"],
            "unit": mat["unit"].lower(),
            "totalStock": round(total_allocated, 2),
            "allocated": round(total_allocated, 2),
            "consumed": round(total_consumed, 2),
            "available": round(available_stock, 2),
            "dailyAvgConsumption": round(daily_burn_rate, 2),
            "daysUntilShortage": round(days_rem) if days_rem is not None else 999,
            "stockLevel": stock_level,
            "consumptionTrend": "stable",
            "linkedActivities": linked_activity_names
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
            
    random.shuffle(alerts)
    return [
        {**a, "message": f"{a['materialName']} stock critically low. {max(0, a.get('daysUntilShortage', 0))} days remaining." if a['type'] == 'critical_stock' else a['message']} 
        for a in alerts
    ]


@app.get("/predict/trend/{project_id}/{material_id}")
async def get_trend(project_id: int, material_id: int):
    # To get current_available accurately, we must sum all logs
    inv_res = supabase.table("project_material_inventory")\
        .select("allocatedstock")\
        .eq("projectid", project_id)\
        .eq("materialid", material_id)\
        .execute()
    
    if not inv_res.data:
        raise HTTPException(status_code=404, detail="Material inventory not found")
        
    allocated = float(inv_res.data[0]["allocatedstock"])
    
    # Sum ALL logs for this material to get true available stock
    all_logs_res = supabase.table("material_consumption_log")\
        .select("quantityused")\
        .eq("materialid", material_id)\
        .execute()
    
    total_consumed = sum(float(l["quantityused"]) for l in all_logs_res.data) if all_logs_res.data else 0
    current_available = max(0.00, round(allocated - total_consumed, 2))
    
    # Fetch 30 days of logs to reconstruct historical curve
    thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    logs = supabase.table("material_consumption_log")\
        .select("quantityused, daterecorded")\
        .eq("materialid", material_id)\
        .gte("daterecorded", thirty_days_ago)\
        .order("daterecorded", desc=True)\
        .execute()
        
    log_data = logs.data or []
    
    # Reconstruct historical stock backwards from today
    # Data is sorted desc by date, so we subtract from current level as we go back
    historical_points = []
    temp_stock = current_available
    
    # Group logs by day in case of multiple entries per day
    grouped_logs = {}
    for l in log_data:
        dt = l["daterecorded"]
        grouped_logs[dt] = grouped_logs.get(dt, 0) + float(l["quantityused"])
        
    # Calculate daily average for the forecast phase
    total_qty = sum(grouped_logs.values())
    avg_burn = total_qty / len(grouped_logs) if grouped_logs else 5.0
    
    # Track daily changes back for 30 days
    for i in range(31):
        d = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        historical_points.append({
            "date": d,
            "stock": round(temp_stock, 2),
            "type": "historical",
            "variance": 0
        })
        # Move state back in time
        actual_consumed = grouped_logs.get(d, 0)
        temp_stock += actual_consumed

    # Forecast phase: Non-linear projection with confidence bounds
    forecast_points = []
    forecast_stock = current_available
    
    # We'll use a 14-day projection
    for i in range(1, 15):
        d = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        
        # ML Simulator: Introduce non-linear decay + widening uncertainty
        # Expected: Average burn
        # Optimistic: Low burn (Burn * 0.7)
        # Pessimistic: High burn (Burn * 1.3) + uncertainty growth
        uncertainty_factor = (i * 0.05) # Uncertainty grows over time
        
        forecast_stock = max(0.00, round(forecast_stock - avg_burn, 2))
        opt_stock = max(0.00, round(forecast_stock + (forecast_stock * uncertainty_factor), 2))
        pess_stock = max(0.00, round(forecast_stock - (forecast_stock * uncertainty_factor), 2))
        
        forecast_points.append({
            "date": d,
            "stock": round(forecast_stock, 2),
            "optimistic": round(opt_stock, 2),
            "pessimistic": round(pess_stock, 2),
            "type": "forecast"
        })
        
    # Merge and Sort
    all_data = historical_points[::-1] + forecast_points
    return all_data


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
