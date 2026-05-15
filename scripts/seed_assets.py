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
    "Lifting & Cranes": 1,
    "Earthmoving": 2,
    "Concreting": 3,
    "Foundation & Piling": 4,
    "Logistics & Transport": 5,
    "Compaction": 6
}

def seed_data():
    print(f"--- STARTING ASSET SEEDING FOR PROJECT {PROJECT_ID} ---")
    
    # 1. CLEANUP
    print("Cleaning existing operational data...")
    try:
        supabase.table("equipment_assignment").delete().neq("activityid", -1).execute()
        supabase.table("equipment_maintenance_log").delete().neq("logid", -1).execute()
        supabase.table("equipment_item").delete().eq("projectid", PROJECT_ID).execute()
    except Exception as e:
        print(f"Cleanup warning (non-critical): {e}")

    # 2. FETCH ACTIVITIES
    activities = supabase.table("activity").select("activityid, description").eq("projectid", PROJECT_ID).execute().data
    if not activities:
        print("CRITICAL: No activities found. Seeding aborted.")
        return
    
    activity_ids = [a['activityid'] for a in activities]
    
    # 3. DEFINE ASSETS
    equipment_classes = [
        {"name": "Earthmoving", "items": [
            ("Caterpillar 320 Next Gen", "SN-EX-001", {"bucket": "1.2m3", "weight": "22t"}),
            ("Komatsu PC210LC-11", "SN-EX-002", {"bucket": "1.1m3", "power": "123kW"}),
            ("Caterpillar D6 Dozer", "SN-DZ-001", {"blade": "3.3m", "power": "161kW"}),
            ("Case 580 Super N", "SN-BH-001", {"depth": "4.4m"}),
            ("Volvo L120H", "SN-WL-001", {"bucket": "3.5m3"}),
            ("JCB 3CX Eco", "SN-BH-002", {"power": "68kW"}),
            ("Bobcat S650", "SN-SS-001", {"payload": "1.2t"}),
            ("John Deere 850L", "SN-DZ-002", {"power": "168kW"})
        ]},
        {"name": "Concreting", "items": [
            ("Putzmeister BSF 36-4", "SN-CP-001", {"reach": "36m", "output": "160m3/h"}),
            ("Schwing S 36 X", "SN-CP-002", {"reach": "35m"}),
            ("Mack Granite Mixer X3", "SN-MT-001", {"capacity": "9m3"}),
            ("Kenworth T880 Mixer", "SN-MT-002", {"capacity": "10m3"}),
            ("Liebherr HTM 905", "SN-MT-003", {"capacity": "9m3"}),
            ("Peterbilt 567 Mixer", "SN-MT-004", {"capacity": "11m3"})
        ]},
        {"name": "Logistics & Transport", "items": [
            ("Mercedes-Benz Arocs", "SN-DT-001", {"payload": "32t"}),
            ("Scania P450 XT", "SN-DT-002", {"payload": "30t"}),
            ("Volvo FMX 460", "SN-DT-003", {"payload": "32t"}),
            ("Isuzu FSR 700", "SN-FB-001", {"length": "7m"}),
            ("MAN TGS 41.400", "SN-DT-004", {"payload": "40t"})
        ]},
        {"name": "Lifting & Cranes", "items": [
            ("Potain MDT 319", "SN-TC-001", {"max_lift": "12t", "jib": "70m"}),
            ("Liebherr LTM 1100", "SN-MC-001", {"capacity": "100t"}),
            ("Manitowoc MLC300", "SN-CC-001", {"capacity": "300t"}),
            ("Grove GMK5250L", "SN-MC-002", {"capacity": "250t"}),
            ("Sany SCC1500", "SN-CC-002", {"capacity": "150t"})
        ]},
        {"name": "Foundation & Piling", "items": [
            ("Bauer BG 24 H", "SN-DR-001", {"max_depth": "65m", "torque": "235kNm"}),
            ("Liebherr LB 28", "SN-DR-002", {"max_depth": "70m"}),
            ("Junttan PMx22", "SN-PR-001", {"hammer": "5t"}),
            ("Casagrande B175", "SN-DR-003", {"depth": "60m"})
        ]},
        {"name": "Compaction", "items": [
            ("Hamm H13i", "SN-RO-001", {"drum": "2.1m", "weight": "13t"}),
            ("Caterpillar CS56B", "SN-RO-002", {"drum": "2.1m"}),
            ("Bomag BW 213 DH-5", "SN-RO-003", {"power": "115kW"}),
            ("Dynapac CA3500D", "SN-RO-004", {"weight": "12t"})
        ]}
    ]

    all_equipment = []
    print("Generating assets...")
    for cls_info in equipment_classes:
        class_id = CLASS_MAP[cls_info['name']]
        for name, sn, specs in cls_info['items']:
            # Human-reported status model
            # 60% chance active/idle, 20% unassigned, 20% down/maint
            roll = random.random()
            if roll < 0.5: status = "active"
            elif roll < 0.7: status = "idle"
            elif roll < 0.85: status = "unassigned"
            elif roll < 0.93: status = "maintenance"
            else: status = "down"

            service_days = random.randint(-10, 30)
            next_service = (datetime.now() + timedelta(days=service_days)).strftime("%Y-%m-%d")
            
            eq_item = {
                "projectid": PROJECT_ID,
                "name": name,
                "classid": class_id,
                "serial_number": sn,
                "status": status,
                "technical_specs": specs,
                "next_service_date": next_service
            }
            res = supabase.table("equipment_item").insert(eq_item).execute()
            if res.data:
                all_equipment.append(res.data[0])

    print(f"SUCCESS: Seeded {len(all_equipment)} assets with 5-state model.")

    # 4. CREATE ACTIVE ASSIGNMENTS
    print("Deploying assets to activities...")
    # Deployments only for 'active' and 'idle' statuses
    deployable = [e for e in all_equipment if e['status'] in ['active', 'idle']]
    
    for eq in deployable:
        act_id = random.choice(activity_ids)
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
