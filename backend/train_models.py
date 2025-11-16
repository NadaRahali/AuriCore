import os
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

import xgboost as xgb
import lightgbm as lgb
import joblib

from imblearn.over_sampling import SMOTE

from features import FEATURES 

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def evaluate_model(name, model, X_valid, y_valid, scaled=False, scaler=None):
    if scaled and scaler is not None:
        X_valid_in = scaler.transform(X_valid)
    else:
        X_valid_in = X_valid

    # --- PROBABILITY HANDLING ---
    if model.__class__.__name__ == "Booster":  
        # LightGBM booster returns probability directly
        probs = model.predict(X_valid_in)
        preds = (probs > 0.5).astype(int)
    else:
        preds = model.predict(X_valid_in)
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_valid_in)[:, 1]
        else:
            probs = preds  # fallback

    print(f"\n=========== {name} ===========")
    print("Accuracy:", round(accuracy_score(y_valid, preds), 4))
    print("Precision:", round(precision_score(y_valid, preds, zero_division=0), 4))
    print("Recall:", round(recall_score(y_valid, preds, zero_division=0), 4))
    print("F1 Score:", round(f1_score(y_valid, preds, zero_division=0), 4))
    print("ROC-AUC:", round(roc_auc_score(y_valid, probs), 4))

# CONFIG
DATA_PATH = "data/synthetic_migraine_data.csv"
USERS_PATH = "data/users.csv"
MODEL_DIR = "models"

os.makedirs(MODEL_DIR, exist_ok=True)

# LOAD DATA
print("Loading data...")
df = pd.read_csv(DATA_PATH)
users_df = pd.read_csv(USERS_PATH)

# Fix date format
df["date"] = pd.to_datetime(df["date"])

# Merge personalization baselines
df = df.merge(users_df, on="user_id", how="left")

# FEATURE ENGINEERING
print("Feature engineering...")

df["sleep_deviation"] = df["sleep_hours"] - df["baseline_sleep"]
df["hrv_deviation"] = df["hrv"] - df["baseline_hrv"]
df["screen_deviation"] = df["screen_time_total_hours"] - df["baseline_screen"]
df["meeting_deviation"] = df["meeting_hours"] - df["baseline_meeting_hours"]

df["pressure_change_abs"] = df["pressure_change"].abs()

df = df.sort_values(["user_id", "date"])

for col in ["sleep_hours", "hrv", "screen_time_total_hours", "meeting_hours"]:
    df[f"{col}_3d_avg"] = (
        df.groupby("user_id")[col]
        .rolling(3)
        .mean()
        .reset_index(level=0, drop=True)
    )


TARGET = "migraine_next_24h"

df = df.dropna(subset=FEATURES + [TARGET])

X = df[FEATURES].values
y = df[TARGET].values

print("Balancing dataset with SMOTE...")
sm = SMOTE(random_state=42)
X, y = sm.fit_resample(X, y)

# TRAIN/VALIDATION SPLIT
print("Splitting train/valid...")
X_train, X_valid, y_train, y_valid = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# SCALING
print("Scaling features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_valid_scaled = scaler.transform(X_valid)

joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")

# MODEL 1 — Logistic Regression
print("Training Logistic Regression...")
logreg = LogisticRegression(max_iter=500)
logreg.fit(X_train_scaled, y_train)
joblib.dump(logreg, f"{MODEL_DIR}/logreg.pkl")

# MODEL 2 — Random Forest
print("Training Random Forest...")
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    n_jobs=-1
)
rf.fit(X_train, y_train)
joblib.dump(rf, f"{MODEL_DIR}/random_forest.pkl")

# MODEL 3 — XGBoost
print("Training XGBoost...")
xgb_model = xgb.XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric="logloss"
)
xgb_model.fit(X_train_scaled, y_train)
joblib.dump(xgb_model, f"{MODEL_DIR}/xgboost.pkl")

# MODEL 4 — LightGBM
print("Training LightGBM...")
lgb_train = lgb.Dataset(X_train_scaled, y_train)
lgb_valid = lgb.Dataset(X_valid_scaled, y_valid)

params = {
    "objective": "binary",
    "metric": "binary_logloss",
    "learning_rate": 0.05,
    "num_leaves": 32,
    "feature_fraction": 0.8,
    "verbose": -1
}

lgb_model = lgb.train(
    params=params,
    train_set=lgb_train,
    valid_sets=[lgb_train, lgb_valid],
    num_boost_round=400,
    callbacks=[lgb.log_evaluation(period=50)]
)

joblib.dump(lgb_model, f"{MODEL_DIR}/lightgbm.pkl")

# MODEL 5 — Personalized baseline
print("Training personalized baseline deviation model...")

personal_features = [
    "sleep_deviation",
    "hrv_deviation",
    "screen_deviation",
    "meeting_deviation",
]

X_personal = df[personal_features].values
y_personal = df[TARGET].values

Xp_train, Xp_valid, yp_train, yp_valid = train_test_split(
    X_personal, y_personal, test_size=0.2, random_state=42, stratify=y_personal
)

personal_model = LogisticRegression(max_iter=300)
personal_model.fit(Xp_train, yp_train)
joblib.dump(personal_model, f"{MODEL_DIR}/personalized_model.pkl")

print("All models trained & saved successfully!")

evaluate_model(
    "Logistic Regression",
    logreg,
    X_valid,
    y_valid,
    scaled=True,
    scaler=scaler
)

evaluate_model(
    "Random Forest",
    rf,
    X_valid,
    y_valid,
    scaled=False
)

evaluate_model(
    "XGBoost",
    xgb_model,
    X_valid,
    y_valid,
    scaled=True,
    scaler=scaler
)

evaluate_model(
    "LightGBM",
    lgb_model,
    X_valid,
    y_valid,
    scaled=True,
    scaler=scaler
)

evaluate_model(
    "Personalized Baseline Model",
    personal_model,
    Xp_valid,
    yp_valid,
    scaled=False
)