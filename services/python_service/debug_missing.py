import requests
import json

def find_missing_units():
    url = "http://localhost:3000/api/project/1/equipment"
    try:
        response = requests.get(url)
        data = response.json()
        equipment = data.get("equipment", [])
        
        print("--- ANALYSIS OF FOUNDATION & PILING ---")
        foundation_units = [e for e in equipment if e.get("className") == "Foundation & Piling"]
        print(f"Total found: {len(foundation_units)}")
        
        for e in foundation_units:
            print(f"Name: {e['name']}, Status: '{e['status']}', Raw: {json.dumps(e['status'])}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_missing_units()
