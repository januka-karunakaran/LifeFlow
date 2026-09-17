import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

print("Loading dataset...")
df = pd.read_csv('data/dataset.csv')

# 1. Select features (inputs) and target (output)
features = [
    'sleep_hours', 'work_hours', 'screen_time', 'exercise_minutes', 
    'break_minutes', 'meetings', 'social_media_minutes', 
    'mood_score', 'previous_productivity'
]
target = 'productivity_score'

X = df[features]
y = df[target]

# 2. Split data into training (80%) and testing (20%) sets
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train the Random Forest Regressor model
print("Training Random Forest Regressor... This might take a few seconds.")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. Evaluate the model using MAE, RMSE, and R2
print("Evaluating model...")
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n--- Evaluation Metrics ---")
print(f"MAE  : {mae:.2f} (Average error in prediction)")
print(f"RMSE : {rmse:.2f}")
print(f"R2   : {r2:.2f} (Accuracy score closest to 1.0 is best)")
print("--------------------------\n")

# 5. Save the trained model to the models folder using joblib
print("Saving model...")
joblib.dump(model, 'models/productivity_model.pkl')
joblib.dump(features, 'models/productivity_features.pkl') # Saving feature list for API

print("Success! Productivity Model saved to models/productivity_model.pkl")