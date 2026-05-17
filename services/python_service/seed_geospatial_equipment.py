import os
import random
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configuration
PROJECT_ID = 1
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Critical Failure: Supabase credentials missing in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_geospatial_equipment():
    print("[INFO] Aligning Construction Zones, Activities, and Equipment Deployments...")

    # 1. Clear previous assignments to avoid duplicate key or constraints
    print("[INFO] Cleaning legacy equipment assignments & maintenance logs...")
    try:
        supabase.table("equipment_assignment").delete().neq("assignmentid", 0).execute()
        supabase.table("equipment_maintenance_log").delete().neq("logid", 0).execute()
        print("[SUCCESS] Assignments and maintenance logs purged.")
    except Exception as e:
        print("[WARNING] Warning during purge:", e)

    # 2. Setup highly detailed construction project zones in project_zone (referenced by assignments)
    zones_data = [
        {
            "zoneid": 1,
            "projectid": PROJECT_ID,
            "name": "Zone A",
            "description": "Earth Excavation",
            "activity": "Earth Excavation & Trenching",
            "status": "IN_PROGRESS",
            "progress": 80,
            "lat": 6.926268,
            "lng": 79.860464,
            "posx": 25.0,
            "posy": 25.0,
            "widthpercent": 30.0,
            "heightpercent": 30.0,
            "displayorder": 1,
            "markerlabel": "A"
        },
        {
            "zoneid": 2,
            "projectid": PROJECT_ID,
            "name": "Zone B",
            "description": "Material Handling",
            "activity": "Material Handling & Storage",
            "status": "IN_PROGRESS",
            "progress": 60,
            "lat": 6.926087,
            "lng": 79.860172,
            "posx": 65.0,
            "posy": 20.0,
            "widthpercent": 25.0,
            "heightpercent": 25.0,
            "displayorder": 2,
            "markerlabel": "B"
        },
        {
            "zoneid": 3,
            "projectid": PROJECT_ID,
            "name": "Zone C",
            "description": "Concrete Pour",
            "activity": "Foundation Concrete Pouring",
            "status": "IN_PROGRESS",
            "progress": 45,
            "lat": 6.926338,
            "lng": 79.859616,
            "posx": 35.0,
            "posy": 70.0,
            "widthpercent": 30.0,
            "heightpercent": 25.0,
            "displayorder": 3,
            "markerlabel": "C"
        },
        {
            "zoneid": 4,
            "projectid": PROJECT_ID,
            "name": "Zone D",
            "description": "Steel Erection",
            "activity": "Structural Steel & Cranes",
            "status": "IN_PROGRESS",
            "progress": 30,
            "lat": 6.926658,
            "lng": 79.860024,
            "posx": 75.0,
            "posy": 65.0,
            "widthpercent": 20.0,
            "heightpercent": 30.0,
            "displayorder": 4,
            "markerlabel": "D"
        },
        {
            "zoneid": 5,
            "projectid": PROJECT_ID,
            "name": "Staging Area",
            "description": "Staging & Support Areas",
            "activity": "Equipment Parking & Support",
            "status": "IN_PROGRESS",
            "progress": 90,
            "lat": 6.925900,
            "lng": 79.860200,
            "posx": 50.0,
            "posy": 45.0,
            "widthpercent": 20.0,
            "heightpercent": 20.0,
            "displayorder": 5,
            "markerlabel": "S"
        }
    ]

    print("[INFO] Populating project_zone table...")
    for z in zones_data:
        try:
            # Check if exists
            exists = supabase.table("project_zone").select("zoneid").eq("zoneid", z["zoneid"]).execute()
            if exists.data:
                supabase.table("project_zone").update(z).eq("zoneid", z["zoneid"]).execute()
            else:
                supabase.table("project_zone").insert(z).execute()
        except Exception as e:
            print(f"Error seeding project_zone {z['name']}: {e}")

    # 3. Align the activity table (so that GET /api/project/1/zones works flawlessly)
    print("[INFO] Aligning activities to zones in the activity table...")
    for z in zones_data:
        # Check if activity with this name/description exists
        exists = supabase.table("activity").select("activityid").eq("projectid", PROJECT_ID).eq("name", z["name"]).execute()
        act_row = {
            "projectid": PROJECT_ID,
            "name": z["name"],
            "description": z["description"],
            "progress": z["progress"],
            "status": "IN_PROGRESS",
            "lat": z["lat"],
            "lng": z["lng"],
            "posx": z["posx"],
            "posy": z["posy"],
            "widthpercent": z["widthpercent"],
            "heightpercent": z["heightpercent"],
            "displayorder": z["displayorder"],
            "markerlabel": z["markerlabel"]
        }
        if exists.data:
            supabase.table("activity").update(act_row).eq("activityid", exists.data[0]["activityid"]).execute()
        else:
            supabase.table("activity").insert(act_row).execute()

    print("[SUCCESS] Zones and Activity layers fully synchronized.")

    # 4. Fetch all activities to get their IDs
    all_activities = supabase.table("activity").select("activityid, name").eq("projectid", PROJECT_ID).execute()
    activity_map = {act["name"]: act["activityid"] for act in all_activities.data if act.get("name")}

    # 5. Fetch all equipment classes
    all_classes = supabase.table("equipment_class").select("classid, name").execute()
    class_map = {c["name"]: c["classid"] for c in all_classes.data}

    # If classes are empty, insert them
    if not class_map:
        print("[INFO] Seeding equipment classes...")
        classes = [
            {"name": "Cranes & Lifting Gear", "description": "Tower cranes, mobile cranes, and crawler cranes"},
            {"name": "Heavy Earthmovers", "description": "Excavators, bulldozers, and graders"},
            {"name": "Concrete Fleet", "description": "Mixer trucks and pump systems"},
            {"name": "Drilling & Piling Rigs", "description": "Rigs and hammers for deep foundation"},
            {"name": "Trucks & Transport", "description": "Dump trucks and flatbeds"},
            {"name": "Rollers & Compactors", "description": "Rollers and compactors"}
        ]
        for c in classes:
            supabase.table("equipment_class").insert(c).execute()
        all_classes = supabase.table("equipment_class").select("classid, name").execute()
        class_map = {c["name"]: c["classid"] for c in all_classes.data}

    # 6. Fetch or insert realistic equipment units
    print("[INFO] Fetching equipment units...")
    all_eq = supabase.table("equipment_item").select("*").eq("projectid", PROJECT_ID).execute()
    
    # If equipment is empty or we want to overwrite, ensure we have a robust list
    equipment_templates = [
        # Cranes & Lifting Gear (Zone D)
        {"name": "TC-001 Tower Crane Potain", "class": "Cranes & Lifting Gear", "sn": "TC-P-319-01", "specs": {"max_lift_capacity": "16 Tons", "max_reach": "70m", "model": "Potain MDT 319", "power_type": "Electric", "utilization": 88, "fuel_level": 95, "assigned_crew": "Rigging Team Alpha", "assigned_engineer": "Alex Kim", "last_update": "2 min ago"}},
        {"name": "TC-002 Tower Crane Potain", "class": "Cranes & Lifting Gear", "sn": "TC-P-219-02", "specs": {"max_lift_capacity": "10 Tons", "max_reach": "60m", "model": "Potain MDT 219", "power_type": "Electric", "utilization": 72, "fuel_level": 90, "assigned_crew": "Rigging Team Beta", "assigned_engineer": "Sarah Jenkins", "last_update": "10 min ago"}},
        {"name": "MC-001 Mobile Crane Liebherr", "class": "Cranes & Lifting Gear", "sn": "MC-L-1100-01", "specs": {"max_lift_capacity": "100 Tons", "max_reach": "52m", "model": "Liebherr LTM 1100", "power_type": "Diesel", "utilization": 85, "fuel_level": 48, "assigned_crew": "Heavy Lift Crew 1", "assigned_engineer": "James Patel", "last_update": "5 min ago"}},
        
        # Heavy Earthmovers (Zone A)
        {"name": "EX-001 Excavator Volvo", "class": "Heavy Earthmovers", "sn": "EX-V-480-01", "specs": {"bucket_capacity": "2.8 m3", "operating_weight": "48 Tons", "model": "Volvo EC480 Hard-Rock", "power_type": "Diesel", "utilization": 92, "fuel_level": 74, "assigned_crew": "Excavation Crew A", "assigned_engineer": "David Miller", "last_update": "1 min ago"}},
        {"name": "EX-002 Excavator Volvo", "class": "Heavy Earthmovers", "sn": "EX-V-480-02", "specs": {"bucket_capacity": "2.8 m3", "operating_weight": "48 Tons", "model": "Volvo EC480 Hard-Rock", "power_type": "Diesel", "utilization": 80, "fuel_level": 60, "assigned_crew": "Excavation Crew A", "assigned_engineer": "David Miller", "last_update": "15 min ago"}},
        {"name": "EX-003 Excavator Caterpillar", "class": "Heavy Earthmovers", "sn": "EX-C-320-03", "specs": {"bucket_capacity": "1.2 m3", "operating_weight": "22 Tons", "model": "Caterpillar 320 Next Gen", "power_type": "Diesel", "utilization": 94, "fuel_level": 35, "assigned_crew": "Trenching Crew B", "assigned_engineer": "Marcus Wong", "last_update": "4 min ago"}},
        {"name": "DZ-001 Dozer Caterpillar", "class": "Heavy Earthmovers", "sn": "DZ-C-D6-01", "specs": {"blade_capacity": "5.6 m3", "operating_weight": "24 Tons", "model": "Caterpillar D6 Dozer", "power_type": "Diesel", "utilization": 65, "fuel_level": 82, "assigned_crew": "Grading Team 1", "assigned_engineer": "Robert Chen", "last_update": "30 min ago"}},
        {"name": "GR-001 Grader Komatsu", "class": "Heavy Earthmovers", "sn": "GR-K-655-01", "specs": {"blade_width": "4.3m", "operating_weight": "19 Tons", "model": "Komatsu GD655-6", "power_type": "Diesel", "utilization": 45, "fuel_level": 50, "assigned_crew": "Grading Team 1", "assigned_engineer": "Robert Chen", "last_update": "1 hr ago"}},

        # Concrete Fleet (Zone C)
        {"name": "BP-001 Concrete Boom Pump", "class": "Concrete Fleet", "sn": "CP-P-36-01", "specs": {"reach_height": "36m", "output_capacity": "160 m3/h", "model": "Putzmeister 36m Boom", "power_type": "Diesel", "utilization": 87, "fuel_level": 68, "assigned_crew": "Foundation Pour Team", "assigned_engineer": "Elena Rostova", "last_update": "2 min ago"}},
        {"name": "MX-001 Mixer Truck Mack", "class": "Concrete Fleet", "sn": "MX-M-G1-01", "specs": {"drum_capacity": "8.0 m3", "model": "Mack Granite Mixer", "power_type": "Diesel", "utilization": 75, "fuel_level": 80, "assigned_crew": "Transit Mix Logistics", "assigned_engineer": "Elena Rostova", "last_update": "12 min ago"}},
        {"name": "MX-002 Mixer Truck Mack", "class": "Concrete Fleet", "sn": "MX-M-G1-02", "specs": {"drum_capacity": "8.0 m3", "model": "Mack Granite Mixer", "power_type": "Diesel", "utilization": 78, "fuel_level": 55, "assigned_crew": "Transit Mix Logistics", "assigned_engineer": "Elena Rostova", "last_update": "5 min ago"}},
        {"name": "MX-003 Mixer Truck Mack", "class": "Concrete Fleet", "sn": "MX-M-G1-03", "specs": {"drum_capacity": "8.0 m3", "model": "Mack Granite Mixer", "power_type": "Diesel", "utilization": 0, "fuel_level": 0, "assigned_crew": "Transit Mix Logistics", "assigned_engineer": "Elena Rostova", "last_update": "2 days ago"}},

        # Drilling & Piling Rigs (Staging Area / Zone B)
        {"name": "PR-001 Piling Rig Casagrande", "class": "Drilling & Piling Rigs", "sn": "PR-C-175-01", "specs": {"max_drilling_depth": "60m", "max_drilling_diameter": "1800mm", "model": "Casagrande B175 Rig", "power_type": "Diesel", "utilization": 91, "fuel_level": 62, "assigned_crew": "Deep Foundation Team", "assigned_engineer": "Viktor Vance", "last_update": "3 min ago"}},
        {"name": "PR-002 Rotary Rig Mait", "class": "Drilling & Piling Rigs", "sn": "PR-M-130-02", "specs": {"max_drilling_depth": "45m", "max_drilling_diameter": "1500mm", "model": "Mait HR130 Rig", "power_type": "Diesel", "utilization": 82, "fuel_level": 40, "assigned_crew": "Deep Foundation Team", "assigned_engineer": "Viktor Vance", "last_update": "8 min ago"}},

        # Trucks & Transport
        {"name": "DT-001 Tipper Truck Scania", "class": "Trucks & Transport", "sn": "DT-S-440-01", "specs": {"payload_capacity": "25 Tons", "model": "Scania G440 Tipper", "power_type": "Diesel", "utilization": 88, "fuel_level": 70, "assigned_crew": "Hauling Crew 1", "assigned_engineer": "Frank Castillo", "last_update": "10 min ago"}},
        {"name": "DT-002 Tipper Truck Scania", "class": "Trucks & Transport", "sn": "DT-S-440-02", "specs": {"payload_capacity": "25 Tons", "model": "Scania G440 Tipper", "power_type": "Diesel", "utilization": 74, "fuel_level": 82, "assigned_crew": "Hauling Crew 1", "assigned_engineer": "Frank Castillo", "last_update": "3 min ago"}}
    ]

    print("[INFO] Populating equipment items with premium specs & status...")
    inserted_items = []
    for eq_t in equipment_templates:
        class_id = class_map.get(eq_t["class"])
        if not class_id:
            print(f"[WARNING] Class {eq_t['class']} not found in database! Skipping.")
            continue
        
        status = "active"
        if "TC-002" in eq_t["name"]:
            status = "idle"
        elif "MX-003" in eq_t["name"]:
            status = "down"
        elif "DZ-001" in eq_t["name"]:
            status = "maintenance"

        next_svc = (datetime.now() + timedelta(days=random.randint(5, 30))).strftime("%Y-%m-%d")
        if status == "down":
            next_svc = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")

        item_row = {
            "name": eq_t["name"],
            "classid": class_id,
            "projectid": PROJECT_ID,
            "serial_number": eq_t["sn"],
            "status": status,
            "next_service_date": next_svc,
            "last_service_date": (datetime.now() - timedelta(days=random.randint(30, 90))).strftime("%Y-%m-%d"),
            "technical_specs": eq_t["specs"]
        }

        # Check if exists
        exists = supabase.table("equipment_item").select("itemid").eq("serial_number", eq_t["sn"]).execute()
        if exists.data:
            res = supabase.table("equipment_item").update(item_row).eq("itemid", exists.data[0]["itemid"]).execute()
            inserted_items.append(res.data[0])
        else:
            res = supabase.table("equipment_item").insert(item_row).execute()
            inserted_items.append(res.data[0])

    print(f"[SUCCESS] Seeding finished for {len(inserted_items)} equipment units.")

    # 7. Create Active Assignments for these items to distribute them beautifully!
    print("[INFO] Generating equipment assignments across Zones A, B, C, D, and Staging...")
    for item in inserted_items:
        # Determine target zone and activity
        zone_id = 5 # Default Staging
        target_zone_name = "Staging Area"

        if "Excavator" in item["name"] or "Dozer" in item["name"] or "Grader" in item["name"]:
            zone_id = 1 # Zone A (Earth Excavation)
            target_zone_name = "Zone A"
        elif "Tipper Truck" in item["name"]:
            zone_id = 2 # Zone B (Material Handling)
            target_zone_name = "Zone B"
        elif "Mixer" in item["name"] or "Boom Pump" in item["name"]:
            zone_id = 3 # Zone C (Concrete Pour)
            target_zone_name = "Zone C"
        elif "Tower Crane" in item["name"] or "Mobile Crane" in item["name"]:
            zone_id = 4 # Zone D (Steel Erection)
            target_zone_name = "Zone D"
        elif "Piling Rig" in item["name"] or "Rotary Rig" in item["name"]:
            zone_id = 5 # Staging Area
            target_zone_name = "Staging Area"

        activity_id = activity_map.get(target_zone_name)
        if not activity_id:
            continue

        assign_row = {
            "itemid": item["itemid"],
            "zoneid": zone_id,
            "activityid": activity_id,
            "start_date": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"),
            "end_date": None
        }
        supabase.table("equipment_assignment").insert(assign_row).execute()

    print("[SUCCESS] Assignments mapped.")

    # 8. Create historical maintenance logs for items to generate realistic reliability scores
    print("[INFO] Generating historical maintenance logs for reliability calculations...")
    for item in inserted_items:
        # Create resolved preventive service
        supabase.table("equipment_maintenance_log").insert({
            "itemid": item["itemid"],
            "issue_type": "preventive_service",
            "description": "Routine 500-hour service and mechanical inspections.",
            "reported_at": (datetime.now() - timedelta(days=45)).isoformat() + "Z",
            "resolved_at": (datetime.now() - timedelta(days=44.5)).isoformat() + "Z",
            "downtime_hours": 12,
            "resolution_notes": "Completed oil change, fluid replacements, filter swaps, and minor seal corrections."
        }).execute()

        # If it's down, add a pending breakdown log
        if item["status"] == "down":
            supabase.table("equipment_maintenance_log").insert({
                "itemid": item["itemid"],
                "issue_type": "breakdown",
                "description": "Critical cooling system rupture and radiator stall under heavy load.",
                "reported_at": (datetime.now() - timedelta(days=2)).isoformat() + "Z",
                "resolved_at": None,
                "downtime_hours": None,
                "resolution_notes": None
            }).execute()

        # Some items have minor resolved incidents
        if "MC-001" in item["name"] or "EX-003" in item["name"]:
            supabase.table("equipment_maintenance_log").insert({
                "itemid": item["itemid"],
                "issue_type": "breakdown",
                "description": "Sensory calibration fault during crane lift.",
                "reported_at": (datetime.now() - timedelta(days=20)).isoformat() + "Z",
                "resolved_at": (datetime.now() - timedelta(days=19.5)).isoformat() + "Z",
                "downtime_hours": 12,
                "resolution_notes": "Re-calibrated lift metrics sensor and cleared error code logs."
            }).execute()

    print("[SUCCESS] Database successfully aligned with premium geospatial dataset!")

if __name__ == "__main__":
    seed_geospatial_equipment()
