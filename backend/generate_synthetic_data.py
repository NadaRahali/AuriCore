"""
Generate synthetic migraine prediction dataset (~1,000,000 rows)
using real daily weather from FMI (Finland) + synthetic user behavior.

Outputs:
  data/users.csv                   - user-level baselines (for personalization)
  data/synthetic_migraine_data.csv - daily-level features + labels

Run:
  python generate_synthetic_data.py
"""

import os
import math
from datetime import datetime

import numpy as np
import pandas as pd
import requests
from io import StringIO
from tqdm import tqdm

# ----------------------------
# CONFIG
# ----------------------------

TARGET_ROWS = 1_000_000          # target number of daily records
PLACE = "Helsinki"               # FMI place
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2024, 12, 31)  # 2 years of daily weather
DATA_DIR = "data"

os.makedirs(DATA_DIR, exist_ok=True)


# ----------------------------
# 1. FETCH FMI WEATHER (DAILY)
# ----------------------------

FMI_URL = "https://opendata.fmi.fi/wfs"


def fetch_fmi_weather_daily(start_date: datetime, end_date: datetime, place: str = PLACE) -> pd.DataFrame:
    """
    Fetch daily weather from FMI Open Data (temperature, pressure, humidity, etc.)
    using the 'weather::daily::multipointcoverage' stored query.

    Returns a DataFrame with columns:
      date, temperature, dew_point, pressure, humidity, precipitation, snow_depth
    """
    params = {
        "service": "WFS",
        "version": "2.0.0",
        "request": "getFeature",
        "storedquery_id": "fmi::observations::weather::daily::multipointcoverage",
        "place": place,
        "starttime": start_date.isoformat() + "Z",
        "endtime": end_date.isoformat() + "Z",
    }

    print(f"Fetching FMI weather data for {place} from {start_date.date()} to {end_date.date()}...")
    resp = requests.get(FMI_URL, params=params)
    resp.raise_for_status()
    text = resp.text

    # Extract the numeric data embedded in <gml:doubleOrNilReasonTupleList>...</gml:...>
    start_tag = "<gml:doubleOrNilReasonTupleList>"
    end_tag = "</gml:doubleOrNilReasonTupleList>"

    start_idx = text.find(start_tag)
    end_idx = text.find(end_tag)

    if start_idx == -1 or end_idx == -1:
        raise RuntimeError("Could not find FMI numeric data in the response. Check the storedquery_id / parameters.")

    raw_block = text[start_idx + len(start_tag): end_idx].strip()

    # Numbers are space-separated tuples, one row per day
    df_vals = pd.read_csv(StringIO(raw_block), sep=" ", header=None)

    # Depending on FMI config, the columns are typically:
    # tday, tmin, tmax, dewpoint, pressure, rh, precip, snow_depth, ...
    # We'll label a few of them we care about.
    # Adjust if needed based on your inspection.
    col_map = {
        0: "tday",
        1: "tmin",
        2: "tmax",
        3: "dew_point",
        4: "pressure",
        5: "humidity",
        6: "precipitation",
        7: "snow_depth",
    }
    df_vals = df_vals.rename(columns=col_map)

    # Keep only the columns we need
    keep_cols = [c for c in ["tday", "tmin", "tmax", "dew_point", "pressure", "humidity", "precipitation", "snow_depth"]
                 if c in df_vals.columns]
    df_vals = df_vals[keep_cols]

    # Add date index
    df_vals["date"] = pd.date_range(start_date, periods=len(df_vals), freq="D")

    # For simplicity, define a single "temperature" as daily mean if available
    if "tday" in df_vals.columns:
        df_vals["temperature"] = df_vals["tday"]
    elif "tmin" in df_vals.columns and "tmax" in df_vals.columns:
        df_vals["temperature"] = (df_vals["tmin"] + df_vals["tmax"]) / 2.0
    else:
        df_vals["temperature"] = np.nan

    return df_vals


try:
    weather_df = fetch_fmi_weather_daily(START_DATE, END_DATE, PLACE)
except Exception as e:
    # If FMI call fails (network or API), you can either bail or fallback to synthetic weather.
    print("Failed to fetch FMI data:", e)
    print("Falling back to simple synthetic weather (you can remove this fallback if FMI is mandatory).")

    dates = pd.date_range(START_DATE, END_DATE, freq="D")
    n_days = len(dates)

    # Very simple synthetic weather for Finland-like conditions
    rng = np.random.default_rng(42)
    base_temp = 5 + 15 * np.sin(2 * np.pi * np.arange(n_days) / 365.0)  # seasonal sinus
    temp = base_temp + rng.normal(0, 3, size=n_days)
    pressure = 1013 + rng.normal(0, 8, size=n_days)
    humidity = 70 + rng.normal(0, 10, size=n_days)
    precip = np.maximum(0, rng.normal(1, 3, size=n_days))

    weather_df = pd.DataFrame({
        "date": dates,
        "temperature": temp,
        "pressure": pressure,
        "humidity": humidity,
        "precipitation": precip,
        "snow_depth": rng.normal(0, 2, size=n_days),
    })

# Ensure sorted by date
weather_df = weather_df.sort_values("date").reset_index(drop=True)

# Compute pressure_change (day-to-day difference)
weather_df["pressure_change"] = weather_df["pressure"].diff().fillna(0.0)

print(f"Weather days available: {len(weather_df)}")
print(weather_df.head())


# ----------------------------
# 2. GENERATE USERS (BASELINES)
# ----------------------------

def generate_users_for_target_rows(target_rows: int, n_days: int) -> pd.DataFrame:
    """
    Compute how many users we need to reach at least target_rows = n_users * n_days,
    then generate those users with personal baselines and sensitivities.
    """
    n_users = math.ceil(target_rows / n_days)
    print(f"Generating {n_users} users to reach at least {target_rows} rows (n_days={n_days})")

    rng = np.random.default_rng(123)
    users = []

    for user_id in range(1, n_users + 1):
        u = {
            "user_id": f"user_{user_id}",

            # Personal baselines
            "baseline_sleep": rng.normal(7.0, 0.7),        # hours
            "baseline_hrv": rng.normal(55, 8),            # ms
            "baseline_rhr": rng.normal(65, 5),            # bpm
            "baseline_screen": rng.normal(3.5, 1.0),      # hours/day
            "baseline_meeting_hours": rng.normal(4.0, 1.5),

            # Sensitivities (0–1 scale)
            "sleep_sensitivity": rng.uniform(0.3, 1.0),
            "stress_sensitivity": rng.uniform(0.2, 1.0),
            "screen_sensitivity": rng.uniform(0.1, 0.8),
            "weather_sensitivity": rng.uniform(0.2, 1.0),

            # Base migraine rate (daily probability if everything is normal)
            "base_migraine_rate": rng.uniform(0.01, 0.08),  # 1–8% per day
        }
        users.append(u)

    return pd.DataFrame(users)


n_days = len(weather_df)
users_df = generate_users_for_target_rows(TARGET_ROWS, n_days)

# Save users (for personalisation later)
users_path = os.path.join(DATA_DIR, "users.csv")
users_df.to_csv(users_path, index=False)
print(f"Saved users to {users_path}")


# ----------------------------
# 3. CALENDAR / WORKLOAD MODEL
# ----------------------------

def generate_calendar_for_date(date: pd.Timestamp, rng: np.random.Generator):
    """
    Simple synthetic calendar load:
    - Weekdays: higher meeting load
    - Weekends: minimal load
    Returns: meeting_hours, meeting_count, evening_meetings (0/1)
    """
    weekday = date.weekday()  # 0=Mon ... 6=Sun

    if weekday < 5:  # Mon–Fri
        meeting_hours = max(0.0, rng.normal(4.0, 1.5))
        meeting_count = max(0, int(rng.normal(5, 2)))
        evening_meetings = rng.choice([0, 1], p=[0.7, 0.3])
    else:
        meeting_hours = max(0.0, rng.normal(0.5, 0.4))
        meeting_count = max(0, int(rng.normal(1, 1)))
        evening_meetings = 0

    return meeting_hours, meeting_count, evening_meetings


# ----------------------------
# 4. GENERATE DAILY DATA
# ----------------------------

def generate_daily_data(users_df: pd.DataFrame,
                        weather_df: pd.DataFrame,
                        target_rows: int) -> pd.DataFrame:
    """
    Cross product: users × days, then slice to target_rows.
    For each (user, day) we simulate sleep, HRV, screen time, workload, and migraine risk.
    """
    rng = np.random.default_rng(999)
    dates = weather_df["date"].tolist()
    records = []

    print("Generating daily synthetic data...")

    for _, user in tqdm(users_df.iterrows(), total=len(users_df)):
        for idx, date in enumerate(dates):
            w = weather_df.iloc[idx]

            # Calendar / workload
            meeting_hours, meeting_count, evening_meet = generate_calendar_for_date(date, rng)

            # Physiological + behavior values around personal baseline
            sleep_hours = rng.normal(user.baseline_sleep, 0.8)
            hrv = rng.normal(user.baseline_hrv, 6.0)
            resting_hr = rng.normal(user.baseline_rhr, 4.0)
            screen_total = max(0.1, rng.normal(user.baseline_screen, 1.0))

            # Derived features
            screen_after_22 = max(0.0, rng.normal(0.6 * screen_total, 0.5))
            sedentary_minutes = max(0.0, rng.normal(600, 120))

            # Weather
            pressure_change = w["pressure_change"]
            temperature = w["temperature"]
            humidity = w.get("humidity", np.nan)
            precipitation = w.get("precipitation", np.nan)

            # Risk model (simple but realistic-ish)
            # Start from base migraine rate and add contributions:
            # - worse sleep (below 7h)
            # - high meeting load
            # - extra screen time
            # - big pressure changes
            sleep_deficit = max(0.0, 7.0 - sleep_hours)
            extra_screen = max(0.0, screen_total - user.baseline_screen)
            extra_meetings = max(0.0, meeting_hours - user.baseline_meeting_hours)

            risk = (
                user.base_migraine_rate +
                user.sleep_sensitivity * sleep_deficit * 0.04 +
                user.stress_sensitivity * extra_meetings * 0.03 +
                user.screen_sensitivity * extra_screen * 0.03 +
                user.weather_sensitivity * abs(pressure_change) * 0.01
            )

            # Clamp between 0 and 0.9 for realism
            risk = float(min(max(risk, 0.0), 0.9))

            migraine_today = rng.binomial(1, risk)

            record = {
                "user_id": user.user_id,
                "date": date,

                # physiology / behavior
                "sleep_hours": sleep_hours,
                "hrv": hrv,
                "resting_hr": resting_hr,
                "screen_time_total_hours": screen_total,
                "screen_time_after_22_hours": screen_after_22,
                "sedentary_minutes": sedentary_minutes,

                # calendar
                "meeting_hours": meeting_hours,
                "meeting_count": meeting_count,
                "evening_meetings": evening_meet,

                # weather
                "temperature": temperature,
                "pressure": w["pressure"],
                "pressure_change": pressure_change,
                "humidity": humidity,
                "precipitation": precipitation,
                "snow_depth": w.get("snow_depth", np.nan),

                # target
                "migraine_today": migraine_today,
            }

            records.append(record)

    df = pd.DataFrame(records)
    print(f"Generated {len(df)} rows before slicing to target {target_rows}.")

    # Sort for consistent grouping
    df = df.sort_values(["user_id", "date"]).reset_index(drop=True)

    # Label: migraine_next_24h = next day's migraine_today per user
    df["migraine_next_24h"] = df.groupby("user_id")["migraine_today"].shift(-1).fillna(0).astype(int)

    # Slice down to target_rows (if we generated more)
    if len(df) > target_rows:
        df = df.iloc[:target_rows].copy()
        print(f"Sliced to {target_rows} rows.")

    return df


daily_df = generate_daily_data(users_df, weather_df, TARGET_ROWS)

# ----------------------------
# 5. SAVE DAILY DATA
# ----------------------------

daily_path = os.path.join(DATA_DIR, "synthetic_migraine_data.csv")
daily_df.to_csv(daily_path, index=False)
print(f"Saved daily synthetic dataset to {daily_path}")
print(daily_df.head())
print(daily_df.describe(include="all").transpose().head(20))
