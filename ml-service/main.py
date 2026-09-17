from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="LifeFlow ML API")

# Load trained models
print("Loading ML models...")
try:
    prod_model = joblib.load("models/productivity_model.pkl")
    task_model = joblib.load("models/task_model.pkl")
    disruption_model = joblib.load("models/disruption_model.pkl")
    features_list = joblib.load("models/productivity_features.pkl")
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")

# Define the input data structure using Pydantic
class DailyData(BaseModel):
    sleep_hours: float
    work_hours: float
    screen_time: float
    exercise_minutes: int
    break_minutes: int
    meetings: int
    social_media_minutes: int
    mood_score: int
    previous_productivity: float

@app.get("/")
def read_root():
    return {"message": "LifeFlow ML Service is running"}

@app.post("/predict")
def predict_metrics(data: DailyData):
    # Convert incoming JSON data to a Pandas DataFrame
    input_data = pd.DataFrame([data.model_dump()])
    
    # Ensure column order matches the training data
    input_data = input_data[features_list]
    
    # 1. Predict Productivity Score (Regression)
    prod_score = prod_model.predict(input_data)[0]
    
    # 2. Predict Task Completion Probability (Classification)
    task_prob = task_model.predict_proba(input_data)[0][1] 
    
    # 3. Predict Disruption Risk (Classification)
    disruption = disruption_model.predict(input_data)[0]
    
    return {
        "predicted_productivity": round(float(prod_score), 2),
        "task_completion_probability": round(float(task_prob * 100), 2),
        "disruption_risk": str(disruption)
    }