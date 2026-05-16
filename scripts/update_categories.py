from supabase import create_client, Client

url = "https://hrxjdqxdlgasrbxlrrch.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGpkcXhkbGdhc3JieGxycmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTYyNjMsImV4cCI6MjA5MDI5MjI2M30.mX-LpmkXHxihPJpCFo49yfS8wENP_FwoHhKwSLfaHNM"
supabase: Client = create_client(url, key)

UPDATES = {
    1: "Cranes & Lifting Gear",
    2: "Heavy Earthmovers",
    3: "Concrete Fleet",
    4: "Drilling & Piling Rigs",
    5: "Trucks & Transport",
    6: "Rollers & Compactors"
}

print("Updating Equipment Categories in Database...")
for id, name in UPDATES.items():
    res = supabase.table("equipment_class").update({"name": name}).eq("classid", id).execute()
    if res.data:
        print(f"SUCCESS: Updated ID {id} to '{name}'")
    else:
        print(f"FAILED: ID {id}")

print("--- UPDATE COMPLETE ---")
