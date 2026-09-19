import os
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score, classification_report

# ---------------------------------------------------------
# Step 1: Synthetic Dataset Generation
# ---------------------------------------------------------
def generate_dataset(num_samples: int = 5000, random_seed: int = 42) -> pd.DataFrame:
    """Generates a realistic synthetic lifestyle dataset with productivity and burnout risk targets."""
    np.random.seed(random_seed)
    
    print(f"Generating {num_samples} realistic synthetic lifestyle records...")
    
    # Feature distributions
    sleep_hours = np.random.normal(7.0, 1.4, num_samples).clip(3.5, 11.0).round(1)
    work_hours = np.random.normal(7.5, 2.2, num_samples).clip(1.0, 14.0).round(1)
    screen_time = np.random.normal(6.0, 2.5, num_samples).clip(1.0, 14.0).round(1)
    exercise_minutes = np.random.choice([0, 15, 30, 45, 60, 90], num_samples, p=[0.30, 0.15, 0.25, 0.15, 0.10, 0.05])
    mood_score = np.random.randint(1, 11, num_samples)
    
    # Noise terms
    prod_noise = np.random.normal(0, 4.0, num_samples)
    burnout_noise = np.random.normal(0, 1.5, num_samples)
    
    # 1. Target 1: Continuous Productivity Score (0 to 100)
    # Productivity increases with optimal sleep (around 7-8h), exercise, positive mood, and reasonable work hours.
    # Diminishing returns & fatigue from excessive work hours (>9h) and high screen time.
    productivity = (
        50.0
        + (sleep_hours - 7.0) * 4.0
        + np.where(work_hours <= 8.0, work_hours * 3.0, 24.0 - (work_hours - 8.0) * 2.0)
        - (screen_time - 5.0) * 2.5
        + (exercise_minutes / 30.0) * 3.5
        + (mood_score - 5.0) * 3.2
        + prod_noise
    )
    productivity_score = np.clip(productivity, 5.0, 100.0).round(1)
    
    # 2. Target 2: Categorical Burnout Risk ('Low', 'Medium', 'High')
    # Burnout index increases with long work, heavy screen time, poor sleep, lack of exercise, low mood.
    burnout_score = (
        (work_hours * 1.8)
        + (screen_time * 1.2)
        - (sleep_hours * 2.0)
        - (exercise_minutes / 20.0) * 1.5
        - (mood_score * 1.4)
        + burnout_noise
    )
    
    # Define percentile or threshold boundaries for clean class balance
    q_low = np.percentile(burnout_score, 40)
    q_high = np.percentile(burnout_score, 75)
    
    burnout_risk = []
    for score in burnout_score:
        if score >= q_high:
            burnout_risk.append("High")
        elif score >= q_low:
            burnout_risk.append("Medium")
        else:
            burnout_risk.append("Low")
            
    df = pd.DataFrame({
        'sleep_hours': sleep_hours,
        'work_hours': work_hours,
        'screen_time': screen_time,
        'exercise_minutes': exercise_minutes,
        'mood_score': mood_score,
        'productivity_score': productivity_score,
        'burnout_risk': burnout_risk,
    })
    
    return df

# ---------------------------------------------------------
# Step 2: Model Training & Serialization
# ---------------------------------------------------------
def train_and_save_models():
    base_dir = Path(__file__).resolve().parent
    models_dir = base_dir / "models"
    data_dir = base_dir / "data"
    
    models_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate and save CSV
    df = generate_dataset(num_samples=5000, random_seed=42)
    
    csv_path_root = base_dir / "lifestyle_dataset.csv"
    csv_path_data = data_dir / "lifestyle_dataset.csv"
    df.to_csv(csv_path_root, index=False)
    df.to_csv(csv_path_data, index=False)
    print(f"Dataset successfully saved to:\n  - {csv_path_root}\n  - {csv_path_data}")
    print(f"Dataset shape: {df.shape}")
    print("\nSample records:\n", df.head(3))
    print("\nBurnout Risk Distribution:\n", df['burnout_risk'].value_counts())
    
    # Define features and targets
    feature_columns = ['sleep_hours', 'work_hours', 'screen_time', 'exercise_minutes', 'mood_score']
    X = df[feature_columns]
    y_prod = df['productivity_score']
    y_burnout = df['burnout_risk']
    
    # Train / Test Split
    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(
        X, y_prod, test_size=0.2, random_state=42
    )
    X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(
        X, y_burnout, test_size=0.2, random_state=42, stratify=y_burnout
    )
    
    # ---------------------------------------------------------
    # Train Model 1: Productivity Regressor
    # ---------------------------------------------------------
    print("\nTraining RandomForestRegressor for Productivity Score...")
    prod_model = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    prod_model.fit(X_train_p, y_train_p)
    
    # Evaluate Regressor
    y_pred_p = prod_model.predict(X_test_p)
    r2 = r2_score(y_test_p, y_pred_p)
    mae = mean_absolute_error(y_test_p, y_pred_p)
    print(f"Productivity Regressor R2 Score: {r2:.4f} | MAE: {mae:.2f}")
    
    # ---------------------------------------------------------
    # Train Model 2: Burnout Classifier
    # ---------------------------------------------------------
    print("\nTraining RandomForestClassifier for Burnout Risk...")
    burnout_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    burnout_model.fit(X_train_b, y_train_b)
    
    # Evaluate Classifier
    y_pred_b = burnout_model.predict(X_test_b)
    acc = accuracy_score(y_test_b, y_pred_b)
    print(f"Burnout Classifier Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test_b, y_pred_b))
    
    # ---------------------------------------------------------
    # Save Model Artifacts
    # ---------------------------------------------------------
    artifacts = {
        "model_productivity.pkl": prod_model,
        "model_burnout.pkl": burnout_model,
        "features.pkl": feature_columns,
    }
    
    for filename, obj in artifacts.items():
        # Save in models/
        joblib.dump(obj, models_dir / filename)
        # Save in root ml-service directory as well for flexible loading
        joblib.dump(obj, base_dir / filename)
        print(f"Saved: {models_dir / filename}")
        
    print("\nAll models and artifacts trained and saved successfully!")

if __name__ == "__main__":
    train_and_save_models()
