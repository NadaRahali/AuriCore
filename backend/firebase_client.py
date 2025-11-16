# firebase_client.py
import requests
from typing import Dict, Any, List, Optional

FIREBASE_DB_URL = "https://migraine-personal-predict-default-rtdb.europe-west1.firebasedatabase.app"

def get_user_events(user_id: str) -> List[Dict[str, Any]]:
    url = f"{FIREBASE_DB_URL}/events/{user_id}.json"
    r = requests.get(url, timeout=5)
    r.raise_for_status()
    data = r.json() or {}
    # convert {key: {...}} -> sorted list
    events = []
    for k, v in data.items():
        v["id"] = k
        events.append(v)
    events.sort(key=lambda e: e.get("timestamp", ""))
    return events

def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    url = f"{FIREBASE_DB_URL}/users/{user_id}.json"
    r = requests.get(url, timeout=5)
    if r.status_code == 200:
        return r.json()
    return None

def upsert_user_profile(user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{FIREBASE_DB_URL}/users/{user_id}.json"
    r = requests.put(url, json=payload, timeout=5)
    r.raise_for_status()
    return r.json()
