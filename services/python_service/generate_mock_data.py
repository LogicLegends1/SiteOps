import os
import random
import math
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configuration
PROJECT_ID = 1  # Standard Colombo Metro Tower Mock ID
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Critical Failure: Supabase credentials missing in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_non_linear_consumption(days, base_burn, trend_type="stable"):
    """Generates a list of (date, quantity) with authentic non-linear noise."""
    data = []
    current_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        # Base stochastic noise (±10%)
        noise = (random.random() - 0.5) * (base_burn * 0.2)
        
        # Non-linear components based on case study
        mod = 0
        if trend_type == "spike":
            # Exponential growth
            mod = (i / days) ** 2 * base_burn * 1.5
        elif trend_type == "sine":
            # Seasonal/Weekly variation
            mod = math.sin(i / 3) * (base_burn * 0.3)
        elif trend_type == "drop":
            # Sudden halt (e.g. rain delay)
            mod = -base_burn * 0.8 if i > days * 0.7 else 0
            
        quantity = max(0.5, base_burn + noise + mod)
        data.append({
            "date": (current_date + timedelta(days=i)).strftime("%Y-%m-%d"),
            "quantity": round(quantity, 2)
        })
    return data

def seed_comprehensive_catalog():
    print("📋 Seeding Comprehensive Material Catalog...")
    categories = {
        "Cement": ["OPC Cement", "PPC Cement", "White Cement", "Rapid Hardening Cement"],
        "Aggregates": ["20mm Aggregate", "12mm Aggregate", "M-Sand", "River Sand", "Cracker Dust", "Base Course"],
        "Steel": ["TMT Rebar 10mm", "TMT Rebar 12mm", "TMT Rebar 16mm", "TMT Rebar 25mm", "Binding Wire", "Structural I-Beams", "Steel Plates"],
        "Masonry": ["Standard Bricks", "Cement Blocks 4\"", "Cement Blocks 6\"", "Fly Ash Bricks", "AAC Blocks"],
        "Finishing": ["Ceramic Tiles 2x2", "Porcelain Tiles", "Wall Putty", "Emulsion Paint", "Weather Shield Paint", "Tile Adhesive", "Grout"],
        "Plumbing": ["PVC Pipe 1/2\"", "PVC Pipe 1\"", "PVC Pipe 4\"", "CPVC Pipe", "Brass Fittings", "Water Tank 1000L", "Gate Valves"],
        "Electrical": ["Cable 1.5mm", "Cable 2.5mm", "Cable 6mm", "Conduit Pipes", "Switch Plates", "MCB 16A", "LED Panel Lights"],
        "Roofing": ["GI Sheets", "Polycarbonate Sheets", "Roofing Screws", "Ridge Cappings"],
        "Chemicals": ["Waterproofing Agent", "Admixtures", "Curing Compound", "Anti-Termite Liquid"]
    }
    
    units = {
        "Cement": "BAGS",
        "Aggregates": "CUBES",
        "Steel": "MT",
        "Masonry": "UNITS",
        "Finishing": "SQ_METERS",
        "Plumbing": "MT",
        "Electrical": "MT",
        "Roofing": "SQ_METERS",
        "Chemicals": "CUBES"
    }

    catalog_items = []
    for cat, names in categories.items():
        unit = units.get(cat, "units")
        for name in names:
            catalog_items.append({
                "name": name,
                "category": cat,
                "unit": unit
            })

    # Upsert into catalog
    for item in catalog_items:
        # Check if exists
        exists = supabase.table("material_catalog").select("materialid").eq("name", item["name"]).execute()
        if not exists.data:
            supabase.table("material_catalog").insert(item).execute()
    
    print(f"✅ Catalog expanded to {len(catalog_items)} standardized items.")

def seed_material_data():
    seed_comprehensive_catalog()
    print("🚀 Initializing Operational Data Seed...")
    
    # Fetch all materials from catalog
    all_cat = supabase.table("material_catalog").select("*").execute()
    
    # Link all catalog items to project 1 if not already linked
    for cat_item in all_cat.data:
        exists = supabase.table("project_material_inventory")\
            .select("inventoryid")\
            .eq("projectid", PROJECT_ID)\
            .eq("materialid", cat_item["materialid"])\
            .execute()
            
        if not exists.data:
            supabase.table("project_material_inventory").insert({
                "projectid": PROJECT_ID,
                "materialid": cat_item["materialid"],
                "allocatedstock": random.randint(1000, 10000)
            }).execute()

    # Fetch all project materials to clear their logs
    inv_res = supabase.table("project_material_inventory").select("materialid").eq("projectid", PROJECT_ID).execute()
    mat_ids = [item["materialid"] for item in inv_res.data]
    
    if mat_ids:
        print(f"🧹 Purging legacy logs for {len(mat_ids)} materials...")
        supabase.table("material_consumption_log").delete().in_("materialid", mat_ids).execute()
        print("✅ Clean slate achieved.")

    # Ensure we have diversified activities for the project
    activities_res = supabase.table("activity").select("activityid").eq("projectid", PROJECT_ID).execute()
    if len(activities_res.data or []) < 5:
        print("🌱 Seeding Diversified Project Activities...")
        new_activities = [
            {"projectid": PROJECT_ID, "description": "Structural Framing - Level 4", "status": "IN_PROGRESS"},
            {"projectid": PROJECT_ID, "description": "Lobby Brick Masonry", "status": "IN_PROGRESS"},
            {"projectid": PROJECT_ID, "description": "HVAC Service Installation", "status": "IN_PROGRESS"},
            {"projectid": PROJECT_ID, "description": "Internal Wall Plastering", "status": "IN_PROGRESS"},
            {"projectid": PROJECT_ID, "description": "Foundation Piling - Phase 2", "status": "IN_PROGRESS"}
        ]
        for act in new_activities:
            supabase.table("activity").insert(act).execute()
        print("✅ Activities populated.")

    # Re-fetch inventory with catalog details for the simulation phase
    inv_res = supabase.table("project_material_inventory").select("*, material_catalog(*)").eq("projectid", PROJECT_ID).execute()
    
    scenarios = {
        "Cement": {"burn": 60, "type": "sine"},
        "Steel": {"burn": 5, "type": "spike"},
        "Aggregates": {"burn": 20, "type": "stable"},
        "Masonry": {"burn": 800, "type": "sine"},
        "Plumbing": {"burn": 15, "type": "drop"},
        "Electrical": {"burn": 10, "type": "stable"},
        "Chemicals": {"burn": 2, "type": "spike"}
    }
 
    # Fetch all project activities to diversify linkages
    activities_res = supabase.table("activity").select("activityid, description").eq("projectid", PROJECT_ID).execute()
    activities = activities_res.data or []
    
    if not activities:
        print("⚠️ No activities found for project. Linking to null.")
        activities = [{"activityid": None, "description": "Unknown"}]

    print(f"🔗 Diversifying linkages across {len(activities)} activities...")

    for item in inv_res.data:
        cat_name = item["material_catalog"]["category"]
        name = item["material_catalog"]["name"]
        mat_id = item["materialid"]
        
        config = scenarios.get(cat_name, {"burn": 10, "type": "stable"})
        
        # Select 1-3 activities to associate with this material to create realistic spread
        linked_acts = random.sample(activities, min(len(activities), random.randint(1, 4)))
        
        print(f"📊 Generating trail for: {name} (Linked to: {[a['description'] for a in linked_acts]})")
        points = generate_non_linear_consumption(30, config['burn'], config['type'])
        
        logs = []
        for p in points:
            # For each daily log point, pick one of the linked activities randomly
            target_act = random.choice(linked_acts)
            logs.append({
                "materialid": mat_id,
                "activityid": target_act["activityid"],
                "quantityused": p["quantity"],
                "daterecorded": p["date"],
                "loggedby": 3
            })
            
        chunk_size = 50
        for i in range(0, len(logs), chunk_size):
            supabase.table("material_consumption_log").insert(logs[i:i+chunk_size]).execute()
 
    print("✅ System Overhaul Seed Complete. Analytics and linkage now fully diversified.")

if __name__ == "__main__":
    seed_material_data()
