import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
fourteen_days_ago = (datetime.now() - timedelta(days=14)).strftime('%Y-%m-%d')
res = supabase.table('material_consumption_log').select('logid').gte('daterecorded', fourteen_days_ago).execute()
print(f"DEBUG: Logs in last 14 days: {len(res.data)}")
