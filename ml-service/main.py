import os
from pathlib import Path
from typing import Optional, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np

app = FastAPI(
    title="LifeFlow ML Microservice",
    description="Real-time Machine Learning API for Daily Productivity & Burnout Risk Prediction",
    version="2.0.0"
)

# Enable CORS for frontend and backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

# Helper function to load model file with fallback paths
def load_model_file(filename: str):
    paths_to_check = [
        BASE_DIR / "models" / filename,
        BASE_DIR / filename,
    ]
    for path in paths_to_check:
        if path.exists():
            print(f"Loading {filename} from {path}")
            return joblib.load(path)
    raise FileNotFoundError(f"Model file {filename} could not be located in {paths_to_check}")

# Load models and feature list on startup
try:
    prod_model = load_model_file("model_productivity.pkl")
    burnout_model = load_model_file("model_burnout.pkl")
    try:
        feature_columns = load_model_file("features.pkl")
    except Exception:
        feature_columns = ['sleep_hours', 'work_hours', 'screen_time', 'exercise_minutes', 'mood_score']
    print("[LifeFlow ML] ML models and feature definitions loaded successfully!")
except Exception as e:
    print(f"[LifeFlow ML] Warning during model initialization: {e}")
    prod_model = None
    burnout_model = None
    feature_columns = ['sleep_hours', 'work_hours', 'screen_time', 'exercise_minutes', 'mood_score']


# Pydantic schema for Daily Log payload
class DailyLogInput(BaseModel):
    sleep_hours: float = Field(..., ge=0, le=24, description="Sleep duration in hours")
    work_hours: float = Field(..., ge=0, le=24, description="Work duration in hours")
    screen_time: float = Field(..., ge=0, le=24, description="Total screen time in hours")
    exercise_minutes: float = Field(..., ge=0, le=1440, description="Exercise duration in minutes")
    mood_score: float = Field(..., ge=1, le=10, description="Mood rating from 1 to 10")
    
    # Optional supplementary fields (for backward compatibility / rich logs)
    break_minutes: Optional[float] = 0.0
    meetings: Optional[int] = 0
    social_media_minutes: Optional[float] = 0.0
    tasks_planned: Optional[int] = 0
    tasks_completed: Optional[int] = 0
    previous_productivity: Optional[float] = 0.0
    date: Optional[str] = None


@app.get("/")
def read_root():
    return {
        "service": "LifeFlow ML Microservice",
        "status": "online",
        "models_loaded": prod_model is not None and burnout_model is not None,
        "features": feature_columns
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy" if prod_model and burnout_model else "degraded",
        "productivity_model": prod_model is not None,
        "burnout_model": burnout_model is not None
    }


@app.post("/predict")
def predict_metrics(data: DailyLogInput):
    """
    Accepts daily lifestyle metrics and predicts:
    1. Continuous productivity_score (0-100) using trained RandomForestRegressor
    2. Categorical burnout_risk ('Low', 'Medium', 'High') using trained RandomForestClassifier
    """
    if prod_model is None or burnout_model is None:
        raise HTTPException(
            status_code=503,
            detail="ML Models are not initialized. Please ensure train_model.py has been executed."
        )

    try:
        # Construct DataFrame with the exact feature set and ordering expected by models
        input_dict = {
            'sleep_hours': [float(data.sleep_hours)],
            'work_hours': [float(data.work_hours)],
            'screen_time': [float(data.screen_time)],
            'exercise_minutes': [float(data.exercise_minutes)],
            'mood_score': [float(data.mood_score)],
        }
        input_df = pd.DataFrame(input_dict)[feature_columns]

        # 1. Productivity Score Prediction (Regression)
        raw_prod_score = float(prod_model.predict(input_df)[0])
        productivity_score = round(float(np.clip(raw_prod_score, 0.0, 100.0)), 1)

        # 2. Burnout Risk Prediction (Classification)
        burnout_prediction = str(burnout_model.predict(input_df)[0])

        # Optional class probabilities for fine-grained risk breakdown
        burnout_probs: Dict[str, float] = {}
        if hasattr(burnout_model, "predict_proba") and hasattr(burnout_model, "classes_"):
            probabilities = burnout_model.predict_proba(input_df)[0]
            for cls_name, prob in zip(burnout_model.classes_, probabilities):
                burnout_probs[str(cls_name)] = round(float(prob * 100), 1)

        return {
            "status": "success",
            "productivity_score": productivity_score,
            "predicted_productivity": productivity_score,
            "burnout_risk": burnout_prediction,
            "burnout_probabilities": burnout_probs,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")