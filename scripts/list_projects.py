import os
from supabase import create_client

url = "https://hrxjdqxdlgasrbxlrrch.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyeGpkcXhkbGdhc3JieGxycmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTYyNjMsImV4cCI6MjA5MDI5MjI2M30.mX-LpmkXHxihPJpCFo49yfS8wENP_FwoHhKwSLfaHNM"
supabase = create_client(url, key)

res = supabase.table("project").select("projectid, name").execute()
for p in res.data:
    print(f"{p['projectid']}: {p['name']}")
