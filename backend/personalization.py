from typing import List, Dict, Any, Optional
from datetime import datetime
import statistics


def _safe_float(v, default=None) -> Optional[float]:
    try:
        if v is None:
            return default
        return float(v)
    except Exception:
        return default


def compute_trend(latest: float, history: List[float]) -> Dict[str, Any]:
    """
    Compute simple baseline vs latest difference.
    baseline = mean of history (excluding latest).
    """
    if not history:
        return {
            "latest": latest,
            "baseline": None,
            "delta": None,
            "direction": "stable",
        }

    baseline = statistics.mean(history)
    if latest is None or baseline is None:
        delta = None
        direction = "stable"
    else:
        delta = latest - baseline
        if abs(delta) < 0.3:  # tiny change -> stable
            direction = "stable"
        elif delta > 0:
            direction = "up"
        else:
            direction = "down"

    return {
        "latest": latest,
        "baseline": baseline,
        "delta": delta,
        "direction": direction,
    }


def build_user_summary(user_id: str, events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Build a compact summary object from the user's event history.
    Designed for your mobile app's 'My risk today' + 'Report' screen.
    """

    if not events:
        return {
            "user_id": user_id,
            "events_count": 0,
            "has_data": False,
            "message": "No migraine data yet. Keep the app running so we can learn your patterns.",
        }

    # Latest event (most recent)
    latest = events[-1]
    prev_events = events[:-1]

    # Collect simple numeric histories
    def series(field: str) -> List[float]:
        vals = []
        for e in prev_events:
            v = _safe_float(e.get(field))
            if v is not None:
                vals.append(v)
        return vals

    sleep_hist = series("sleep_hours")
    hrv_hist = series("hrv")
    screen_hist = series("screen_time_total_hours")
    meeting_hist = series("meeting_hours")

    sleep_trend = compute_trend(_safe_float(latest.get("sleep_hours")), sleep_hist)
    hrv_trend = compute_trend(_safe_float(latest.get("hrv")), hrv_hist)
    screen_trend = compute_trend(_safe_float(latest.get("screen_time_total_hours")), screen_hist)
    meeting_trend = compute_trend(_safe_float(latest.get("meeting_hours")), meeting_hist)

    # Current risk from model (already written by n8n)
    risk_score = _safe_float(latest.get("risk_score"))
    risk_level = latest.get("risk_level", "UNKNOWN")
    top_factors = latest.get("top_factors", []) or []

    # Human-friendly insights for the app
    insights: List[str] = []

    def fmt_hours(x: Optional[float]) -> str:
        return f"{x:.1f} h" if x is not None else "N/A"

    if sleep_trend["baseline"] is not None and sleep_trend["delta"] is not None:
        if sleep_trend["direction"] == "down":
            insights.append(
                f"Your sleep was {abs(sleep_trend['delta']):.1f} hours "
                f"below your usual {sleep_trend['baseline']:.1f} h."
            )
        elif sleep_trend["direction"] == "up":
            insights.append(
                f"You slept {sleep_trend['delta']:.1f} hours more than your usual "
                f"{sleep_trend['baseline']:.1f} h."
            )

    if hrv_trend["baseline"] is not None and hrv_trend["delta"] is not None:
        if hrv_trend["direction"] == "down":
            insights.append(
                "Your HRV is lower than usual, which can indicate stress or poor recovery."
            )

    if screen_trend["baseline"] is not None and screen_trend["delta"] is not None:
        if screen_trend["direction"] == "up":
            insights.append(
                f"Your total screen time is higher than usual ({fmt_hours(screen_trend['latest'])}). "
                "Screen exposure, especially in the evening, can trigger migraines."
            )

    if meeting_trend["baseline"] is not None and meeting_trend["delta"] is not None:
        if meeting_trend["direction"] == "up":
            insights.append(
                "You had more meeting hours than usual today, which might increase mental load."
            )

    # Fallback if no specific insights
    if not insights:
        insights.append("Your patterns look close to your usual baseline today.")

    # Build final summary payload
    timestamp = latest.get("timestamp")
    try:
        updated_at = datetime.fromisoformat(timestamp.replace("Z", "+00:00")).isoformat()
    except Exception:
        updated_at = timestamp

    summary: Dict[str, Any] = {
        "user_id": user_id,
        "updated_at": updated_at,
        "events_count": len(events),
        "has_data": True,
        "current_risk": {
            "score": risk_score,
            "level": risk_level,
            "top_factors": top_factors,
        },
        "trends": {
            "sleep_hours": sleep_trend,
            "hrv": hrv_trend,
            "screen_time_total_hours": screen_trend,
            "meeting_hours": meeting_trend,
        },
        "insights": insights,
        "latest_event": latest,
    }

    return summary
