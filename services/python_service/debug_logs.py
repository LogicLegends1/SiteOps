import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
# Get project 1 materials
inv = supabase.table("project_material_inventory").select("materialid").eq("projectid", 1).execute()
m_ids = [m["materialid"] for m in inv.data]

# Get logs for these materials
logs = supabase.table("material_consumption_log").select("activityid").in_("materialid", m_ids).execute()
distinct_acts = set(l["activityid"] for l in logs.data)
print(f"Distinct Activity IDs in logs: {distinct_acts}")

# Get activity names
names = supabase.table("activity").select("activityid, description").in_("activityid", list(distinct_acts)).execute()
print(f"Activity Names: {names.data}")
