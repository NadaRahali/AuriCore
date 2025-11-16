import numpy as np
import joblib


# Load models
scaler = joblib.load("models/scaler.pkl")
logreg = joblib.load("models/logreg.pkl")
rf = joblib.load("models/random_forest.pkl")
xgb_model = joblib.load("models/xgboost.pkl")
lgb_model = joblib.load("models/lightgbm.pkl")  # Booster

FEATURES = [
    "sleep_hours",
    "hrv",
    "resting_hr",
    "screen_time_total_hours",
    "screen_time_after_22_hours",
    "meeting_hours",
    "meeting_count",
    "temperature",
    "pressure_change_abs",
    "humidity",
    "precipitation",

    "sleep_deviation",
    "hrv_deviation",
    "screen_deviation",
    "meeting_deviation",

    "sleep_hours_3d_avg",
    "hrv_3d_avg",
    "screen_time_total_hours_3d_avg",
    "meeting_hours_3d_avg",
]



def predict_risk(feature_dict):
    # 1) Build feature vector in correct order
    x = np.array([[feature_dict[f] for f in FEATURES]], dtype=float)

    x_scaled = scaler.transform(x)

    # 2) Get probabilities
    p_log = logreg.predict_proba(x_scaled)[0, 1]
    p_rf = rf.predict_proba(x)[0, 1]
    p_xgb = xgb_model.predict_proba(x_scaled)[0, 1]
    p_lgb = float(lgb_model.predict(x_scaled)[0])  # LightGBM Booster

    # 3) Weighted ensemble (favor LightGBM & XGBoost)
    risk_score = (
        0.45 * p_lgb +
        0.30 * p_xgb +
        0.15 * p_rf +
        0.10 * p_log
    )

    # 4) Softer thresholds to get more MEDIUM / HIGH
    if risk_score < 0.35:
        risk_level = "LOW"
    elif risk_score < 0.65:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # 5) Dummy top_factors for now (for UI)
    top_factors = sorted(
        [
            ("sleep_hours", -feature_dict["sleep_deviation"]),
            ("hrv", -feature_dict["hrv_deviation"]),
            ("screen_time_total_hours", feature_dict["screen_deviation"]),
            ("meeting_hours", feature_dict["meeting_deviation"]),
            ("pressure_change_abs", feature_dict["pressure_change_abs"]),
        ],
        key=lambda x: abs(x[1]),
        reverse=True
    )[:3]

    return {
        "risk_score": float(risk_score),
        "risk_level": risk_level,
        "top_factors": [f for f, _ in top_factors],
    }
