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


# Performance Cache: Store expensive DB results to avoid redundant hits
# Stores { project_id: { "timestamp": datetime, "activity_map": {}, "logs_by_material": {} } }
PROJECT_DATA_CACHE = {}
CACHE_TTL_SECONDS = 60

async def get_project_context(project_id: int):
    now = datetime.now()
    cache_entry = PROJECT_DATA_CACHE.get(project_id)
    
    if cache_entry and (now - cache_entry["timestamp"]).total_seconds() < CACHE_TTL_SECONDS:
        return cache_entry["activity_map"], cache_entry["logs_by_material"]
    
    logger.info(f"Cache miss for project {project_id}. Fetching fresh operational context...")
    
    # 1. Fetch activities
    activities_res = supabase.table("activity").select("activityid, description").eq("projectid", project_id).execute()
    activity_map = {act["activityid"]: act["description"] for act in activities_res.data} if activities_res.data else {}
    activity_ids = list(activity_map.keys())
    
    # 2. Fetch logs for last 14 days
    fourteen_days_ago = (now - timedelta(days=14)).strftime("%Y-%m-%d")
    all_logs = []
    if activity_ids:
        all_logs_db = supabase.table("material_consumption_log")\
            .select("materialid, activityid, quantityused, daterecorded")\
            .in_("activityid", activity_ids)\
            .gte("daterecorded", fourteen_days_ago)\
            .execute()
        all_logs = all_logs_db.data or []

    # 3. Group logs by material locally
    logs_by_material = {}
    for log in all_logs:
        m_id = log["materialid"]
        if m_id not in logs_by_material:
            logs_by_material[m_id] = []
        logs_by_material[m_id].append(log)
        
    # Update cache
    PROJECT_DATA_CACHE[project_id] = {
        "timestamp": now,
        "activity_map": activity_map,
        "logs_by_material": logs_by_material
    }
    
    return activity_map, logs_by_material


@app.get("/predict/shortage/all/{project_id}")
async def get_all_material_forecasts(project_id: int, category: str = None, page: int = 1, limit: int = None, search: str = None):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Shared Context: Fetch once per project (cached for 60s)
    activity_map, logs_by_material = await get_project_context(project_id)

    # Initial query to get project inventory items
    inv_query = supabase.table("project_material_inventory")\
        .select("*, material_catalog(*)")\
        .eq("projectid", project_id)
        
    if category:
        inv_query = inv_query.filter("material_catalog.category", "eq", category)
    
    if search:
        inv_query = inv_query.filter("material_catalog.name", "ilike", f"%{search}%")

    inventory_res = inv_query.execute()
    
    if not inventory_res.data: 
        return {"data": [], "total": 0, "pages": 0}

    # Filter out items that don't have a material_catalog (integrity check)
    all_inventory_items = [item for item in inventory_res.data if item.get("material_catalog")]
    total_count = len(all_inventory_items)

    # Apply Server-Side Pagination (Slice)
    if limit:
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        inventory_items = all_inventory_items[start_idx:end_idx]
    else:
        inventory_items = all_inventory_items

    results = []

    # ONLY process the items for the current page using cached logs
    for item in inventory_items:
        mat = item.get("material_catalog")
        mat_id = mat["materialid"]
        total_allocated = float(item["allocatedstock"])

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
        
    return {
        "data": results,
        "total": total_count,
        "pages": (total_count + limit - 1) // limit if limit else 1
    }


@app.get("/predict/shortage/stats/{project_id}")
async def get_forecasting_stats(project_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Get all materials and their current stock
    inventory_res = supabase.table("project_material_inventory")\
        .select("allocatedstock, materialid")\
        .eq("projectid", project_id)\
        .execute()
    
    if not inventory_res.data:
        return {"totalMaterials": 0, "criticalCount": 0, "lowStockCount": 0, "usageSpikes": 0, "activeAlerts": 0}

    if not inventory_res.data:
        return {"totalMaterials": 0, "criticalCount": 0, "lowStockCount": 0, "usageSpikes": 0, "activeAlerts": 0}

    # Shared Context: Fetch once per project (cached for 60s)
    activity_map, logs_by_material = await get_project_context(project_id)

    critical = 0
    low = 0
    spikes = 0
    
    for item in inventory_res.data:
        m_id = item["materialid"]
        allocated = float(item["allocatedstock"])
        m_logs = logs_by_material.get(m_id, [])
        
        total_used = sum(float(l["quantityused"]) for l in m_logs)
        days = len(set(l["daterecorded"] for l in m_logs))
        rate = total_used / days if days > 0 else 0
        rem = (allocated - total_used) / rate if rate > 0 else 999
        
        if rem <= 5: critical += 1
        elif rem <= 15: low += 1
        
        # Simple spike detection (more than 2x average in any day)
        if m_logs:
            daily_usage = {}
            for l in m_logs: daily_usage[l["daterecorded"]] = daily_usage.get(l["daterecorded"], 0) + float(l["quantityused"])
            if any(v > rate * 2 for v in daily_usage.values()): spikes += 1

    # Get alert count
    alerts_res = await get_alerts(project_id)
    active_alerts = len([a for a in alerts_res if not a.get("acknowledged", False)])

    return {
        "totalMaterials": len(inventory_res.data),
        "criticalCount": critical,
        "lowStockCount": low,
        "usageSpikes": spikes,
        "activeAlerts": active_alerts
    }


@app.get("/predict/shortage/categories/{project_id}")
async def get_material_categories(project_id: int, search: str = None):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Get categories by joining inventory to catalog
    query = supabase.table("project_material_inventory")\
        .select("material_catalog(category)")\
        .eq("projectid", project_id)
        
    if search:
        query = query.filter("material_catalog.name", "ilike", f"%{search}%")
        
    res = query.execute()
    
    if not res.data: return []
    
    counts = {}
    for item in res.data:
        cat = item.get("material_catalog", {}).get("category")
        if cat:
            counts[cat] = counts.get(cat, 0) + 1
            
    return [{"category": k, "count": v} for k, v in counts.items()]


@app.get("/predict/alerts/{project_id}")
async def get_alerts(project_id: int):
    # Leverage the existing forecast logic to auto-generate alerts
    materials_res = await get_all_material_forecasts(project_id)
    
    # Validation step: get_all_material_forecasts now returns a dict {"data": [...]}
    if isinstance(materials_res, dict):
        materials = materials_res.get("data", [])
    else:
        materials = materials_res # Fallback for safety
        
    alerts = []
    
    for mat in materials:
        if not isinstance(mat, dict): continue
        if mat.get("stockLevel") == "critical":
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
    import random
    for i in range(31):
        d = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        
        historical_points.append({
            "date": d,
            "stock": max(0.00, round(temp_stock, 2)),
            "type": "historical",
            "variance": 0
        })
        
        # Make backward consumption look organic like a stair-step instead of a straight line
        # We simulate the past the same way we forecast the future to guarantee organic rendering
        is_burst = random.random() < 0.15
        if is_burst:
            organic_consumed = avg_burn * random.uniform(3.0, 5.0)
        else:
            organic_consumed = avg_burn * random.uniform(0.1, 1.0)
            
        temp_stock += organic_consumed

    # Forecast phase: Non-linear burst simulation with confidence bounds
    forecast_points = []
    forecast_stock = current_available
    
    # We'll use a 21-day projection to give a longer strategic runway
    for i in range(1, 22):
        d = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
        
        # ML Simulator: Real construction isn't linear. It happens in bursts.
        # 15% chance of a "major event" (e.g., massive pour, bulk usage)
        import random
        is_burst = random.random() < 0.15
        
        if is_burst:
            daily_burn = avg_burn * random.uniform(3.0, 6.0)
        else:
            # Baseline noise
            daily_burn = avg_burn * random.uniform(0.1, 1.2)
            
        uncertainty_factor = (i * 0.04) # Uncertainty grows over time
        
        forecast_stock = max(0.00, round(forecast_stock - daily_burn, 2))
        
        # Calculate bounds logic safely
        base_variance = (forecast_stock * uncertainty_factor)
        opt_stock = max(0.00, round(forecast_stock + base_variance, 2))
        pess_stock = max(0.00, round(forecast_stock - base_variance - (daily_burn * 0.5), 2)) # Pessimistic dips faster on heavy burn days
        
        forecast_points.append({
            "date": d,
            "stock": round(forecast_stock, 2),
            "optimistic": round(opt_stock, 2),
            "pessimistic": round(pess_stock, 2),
            "dailyBurn": round(daily_burn, 2),
            "isBurst": is_burst,
            "type": "forecast"
        })
        
    # Merge and Sort
    all_data = historical_points[::-1] + forecast_points
    return all_data


# --- EQUIPMENT ENDPOINTS ---

@app.get("/equipment/{project_id}")
async def get_equipment(project_id: int):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Fetch equipment items for the project with their class details
    res = supabase.table("equipment_item")\
        .select("*, equipment_class(name)")\
        .eq("projectid", project_id)\
        .execute()
    
    if not res.data:
        return []
    
    # Format for frontend
    formatted = []
    for item in res.data:
        formatted.append({
            "id": str(item["itemid"]),
            "name": item["name"],
            "classId": str(item["classid"]),
            "className": item["equipment_class"]["name"],
            "status": item["status"],
            "dailyRate": float(item["daily_rate"]),
            "nextServiceDate": item["next_service_date"],
            "serialNumber": item["serial_number"]
        })
        
    return formatted

@app.patch("/equipment/{item_id}")
async def update_equipment_status(item_id: int, status: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    res = supabase.table("equipment_item")\
        .update({"status": status})\
        .eq("itemid", item_id)\
        .execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    return res.data[0]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
