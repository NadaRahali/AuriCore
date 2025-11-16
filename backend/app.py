from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from pydantic import BaseModel
import uvicorn
import traceback

# Import inference + FEATURES
from inference import predict_risk, FEATURES

# Firebase personalization imports
from firebase_client import get_user_events
from personalization import build_user_summary


app = FastAPI(
    title="Migraine Early Warning API",
    description="Predict migraine risk + personalized summaries (Firebase + ML)",
    version="1.0.0",
)

# ==============================
# CORS SETTINGS
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # For hackathon — change later to your mobile app domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# REQUEST MODELS
# ==============================
class PredictionRequest(BaseModel):
    features: dict


# ==============================
# HEALTH CHECK
# ==============================
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Migraine Prediction API",
        "message": "Running and reachable."
    }


# ==============================
# MIGRAINE RISK PREDICTION
# ==============================
@app.post("/predict")
async def predict(request: PredictionRequest):
    try:
        feature_dict = request.features

        # Validate required features strictly
        missing = [f for f in FEATURES if f not in feature_dict]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required features: {missing}"
            )

        # Run model inference
        result = predict_risk(feature_dict)

        return {
            "risk_score": round(result["risk_score"], 4),
            "risk_level": result["risk_level"],
            "top_factors": result["top_factors"],
            "model_version": result.get("model_version", "v1.0"),
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==============================
# GET USER EVENTS (Firebase)
# ==============================
@app.get("/users/{user_id}/events")
def get_events(user_id: str) -> Dict[str, Any]:
    events = get_user_events(user_id)

    return {
        "user_id": user_id,
        "events_count": len(events),
        "events": events
    }


# ==============================
# PERSONALIZED SUMMARY (Firebase)
# ==============================
@app.get("/users/{user_id}/summary")
def get_user_summary(user_id: str) -> Dict[str, Any]:
    events = get_user_events(user_id)

    if not events:
        return {
            "user_id": user_id,
            "events_count": 0,
            "has_data": False,
            "message": "No data yet — keep using the app to build your personalized model."
        }

    summary = build_user_summary(user_id, events)
    return summary


# ==============================
# LOCAL DEV RUNNER
# ==============================
if __name__ == "__main__":
    # Use 0.0.0.0 so mobile app + GCP emulator can connect
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8080
    )
