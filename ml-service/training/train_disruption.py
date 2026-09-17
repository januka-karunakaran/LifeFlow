import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

print("Loading dataset...")
df = pd.read_csv('data/dataset.csv')

features = [
    'sleep_hours', 'work_hours', 'screen_time', 'exercise_minutes', 
    'break_minutes', 'meetings', 'social_media_minutes', 
    'mood_score', 'previous_productivity'
]
target = 'disruption_risk'

X = df[features]
y = df[target]

print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest Classifier (Disruption Risk)...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

print("Evaluating model...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n--- Evaluation Metrics ---")
print(f"Accuracy: {accuracy * 100:.2f}%")
print("--------------------------\n")

print("Saving model...")
joblib.dump(model, 'models/disruption_model.pkl')
print("Success! Disruption Model saved to models/disruption_model.pkl")