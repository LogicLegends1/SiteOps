import os
import random
from datetime import datetime, timedelta
from supabase import create_client, Client

# Database Credentials
url = "https://hrxjdqxdlgasrbxlrrch.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGpkcXhkbGdhc3JieGxycmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTYyNjMsImV4cCI6MjA5MDI5MjI2M30.mX-LpmkXHxihPJpCFo49yfS8wENP_FwoHhKwSLfaHNM"

supabase: Client = create_client(url, key)

PROJECT_ID = 1

# Equipment Class Mapping
CLASS_MAP = {
    "Cranes & Lifting Gear": 1,
    "Heavy Earthmovers": 2,
    "Concrete Fleet": 3,
    "Drilling & Piling Rigs": 4,
    "Trucks & Transport": 5,
    "Rollers & Compactors": 6
}

def seed_data():
    print(f"--- STARTING ASSET SEEDING FOR PROJECT {PROJECT_ID} ---")
    
    # 1. CLEANUP
    print("Cleaning existing operational data...")
    try:
        supabase.table("equipment_assignment").delete().neq("activityid", -1).execute()
        supabase.table("equipment_maintenance_log").delete().neq("logid", -1).execute()
        supabase.table("equipment_item").delete().neq("projectid", -1).execute()
    except Exception as e:
        print(f"Cleanup warning (non-critical): {e}")

    # 2. FETCH ACTIVITIES
    activities = supabase.table("activity").select("activityid, description").eq("projectid", PROJECT_ID).execute().data
    if not activities:
        print("CRITICAL: No activities found. Seeding aborted.")
        return
    
    activity_ids = [a['activityid'] for a in activities]
    
    # 3. DEFINE ASSETS (Functional Name, Model, SN Prefix, Specs)
    equipment_classes = [
        {"name": "Heavy Earthmovers", "items": [
            ("Excavator", "Cat 320", "SN-EX-001", {"bucket": "1.2m3", "weight": "22t"}),
            ("Excavator", "Komatsu PC210", "SN-EX-002", {"bucket": "1.1m3", "power": "123kW"}),
            ("Dozer", "Cat D6", "SN-DZ-001", {"blade": "3.3m", "power": "161kW"}),
            ("Backhoe", "Case 580", "SN-BH-001", {"depth": "4.4m"}),
            ("Wheel Loader", "Volvo L120H", "SN-WL-001", {"bucket": "3.5m3"}),
            ("Backhoe", "JCB 3CX", "SN-BH-002", {"power": "68kW"}),
            ("Skid Steer", "Bobcat S650", "SN-SS-001", {"payload": "1.2t"}),
            ("Dozer", "JD 850L", "SN-DZ-002", {"power": "168kW"})
        ]},
        {"name": "Concrete Fleet", "items": [
            ("Concrete Pump", "Putzmeister 36m", "SN-CP-001", {"reach": "36m", "output": "160m3/h"}),
            ("Concrete Pump", "Schwing 35m", "SN-CP-002", {"reach": "35m"}),
            ("Concrete Mixer", "Mack Granite", "SN-MT-001", {"capacity": "9m3"}),
            ("Concrete Mixer", "Kenworth T880", "SN-MT-002", {"capacity": "10m3"}),
            ("Concrete Mixer", "Liebherr HTM", "SN-MT-003", {"capacity": "9m3"}),
            ("Concrete Mixer", "Peterbilt 567", "SN-MT-004", {"capacity": "11m3"})
        ]},
        {"name": "Trucks & Transport", "items": [
            ("Tipper Truck", "MB Arocs", "SN-DT-001", {"payload": "32t"}),
            ("Tipper Truck", "Scania P450", "SN-DT-002", {"payload": "30t"}),
            ("Tipper Truck", "Volvo FMX", "SN-DT-003", {"payload": "32t"}),
            ("Flatbed Truck", "Isuzu FSR", "SN-FB-001", {"length": "7m"}),
            ("Heavy Tipper", "MAN TGS", "SN-DT-004", {"payload": "40t"})
        ]},
        {"name": "Cranes & Lifting Gear", "items": [
            ("Tower Crane", "Potain MDT", "SN-TC-001", {"max_lift": "12t", "jib": "70m"}),
            ("Mobile Crane", "Liebherr 100t", "SN-MC-001", {"capacity": "100t"}),
            ("Crawler Crane", "Manitowoc 300t", "SN-CC-001", {"capacity": "300t"}),
            ("Mobile Crane", "Grove 250t", "SN-MC-002", {"capacity": "250t"}),
            ("Crawler Crane", "Sany 150t", "SN-CC-002", {"capacity": "150t"})
        ]},
        {"name": "Drilling & Piling Rigs", "items": [
            ("Drilling Rig", "Bauer BG 24", "SN-DR-001", {"max_depth": "65m", "torque": "235kNm"}),
            ("Drilling Rig", "Liebherr LB 28", "SN-DR-002", {"max_depth": "70m"}),
            ("Pile Driver", "Junttan PMx22", "SN-PR-001", {"hammer": "5t"}),
            ("Drilling Rig", "Casagrande B175", "SN-DR-003", {"depth": "60m"})
        ]},
        {"name": "Rollers & Compactors", "items": [
            ("Smooth Drum Roller", "Hamm H13i", "SN-RO-001", {"drum": "2.1m", "weight": "13t"}),
            ("Soil Compactor", "Cat CS56B", "SN-RO-002", {"drum": "2.1m"}),
            ("Padfoot Roller", "Bomag 213", "SN-RO-003", {"power": "115kW"}),
            ("Vibratory Roller", "Dynapac 12t", "SN-RO-004", {"weight": "12t"})
        ]}
    ]

    all_equipment = []
    PROJECT_IDS = [1, 2, 3, 4]
    
    for current_project_id in PROJECT_IDS:
        print(f"Generating fleet for Project {current_project_id}...")
        for cls_info in equipment_classes:
            class_id = CLASS_MAP[cls_info['name']]
            for clean_name, model_name, base_sn, specs in cls_info['items']:
                num_units = random.randint(2, 5)
                for unit_idx in range(1, num_units + 1):
                    roll = random.random()
                    if roll < 0.5: status = "active"
                    elif roll < 0.7: status = "idle"
                    elif roll < 0.85: status = "unassigned"
                    elif roll < 0.93: status = "maintenance"
                    else: status = "down"

                    service_days = random.randint(-10, 30)
                    next_service = (datetime.now() + timedelta(days=service_days)).strftime("%Y-%m-%d")
                    
                    full_specs = specs.copy()
                    full_specs["model"] = model_name

                    eq_item = {
                        "projectid": current_project_id,
                        "name": f"{clean_name} #{unit_idx:02d}",
                        "classid": class_id,
                        "serial_number": f"{base_sn}-P{current_project_id}-{unit_idx:02d}",
                        "status": status,
                        "technical_specs": full_specs,
                        "next_service_date": next_service
                    }
                    res = supabase.table("equipment_item").insert(eq_item).execute()
                    if res.data:
                        all_equipment.append(res.data[0])

    print(f"SUCCESS: Seeded {len(all_equipment)} assets total across {len(PROJECT_IDS)} projects.")

    # 4. CREATE ACTIVE ASSIGNMENTS
    print("Deploying assets to activities...")
    deployable = [e for e in all_equipment if e['status'] in ['active', 'idle']]
    
    for eq in deployable:
        # Fetch activities for the SPECIFIC project the equipment belongs to
        activities = supabase.table("activity").select("activityid").eq("projectid", eq['projectid']).execute().data
        if not activities:
            continue
        
        act_id = random.choice([a['activityid'] for a in activities])
        assignment = {
            "itemid": eq['itemid'],
            "activityid": act_id,
            "start_date": (datetime.now() - timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d")
        }
        supabase.table("equipment_assignment").insert(assignment).execute()
    
    print(f"SUCCESS: Created {len(deployable)} active deployments.")

    # 5. GENERATE MAINTENANCE HISTORY
    print("Generating reliability history...")
    for eq in all_equipment:
        for _ in range(random.randint(1, 2)):
            is_breakdown = random.random() > 0.8
            reported_at = (datetime.now() - timedelta(days=random.randint(5, 40))).strftime("%Y-%m-%d")
            
            log = {
                "itemid": eq['itemid'],
                "issue_type": "breakdown" if is_breakdown else "routine_maintenance",
                "description": "Hydraulic system leak" if is_breakdown else "Standard 250h inspection",
                "reported_at": reported_at,
                "resolution_notes": "Repaired hydraulic line" if is_breakdown else "All systems verified."
            }
            supabase.table("equipment_maintenance_log").insert(log).execute()

    print("--- SEEDING COMPLETE ---")

if __name__ == "__main__":
    seed_data()
