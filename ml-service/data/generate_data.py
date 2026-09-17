import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

num_records = 50000

print("Generating synthetic data. Please wait...")

# Generate base features
dates = [datetime(2026, 1, 1) + timedelta(days=i) for i in range(num_records)]
sleep_hours = np.random.normal(7, 1.5, num_records).clip(4, 10)
work_hours = np.random.normal(6, 2, num_records).clip(0, 12)
screen_time = np.random.normal(5, 2.5, num_records).clip(1, 12)
tasks_planned = np.random.randint(1, 10, num_records)
tasks_completed = (tasks_planned * np.random.uniform(0.3, 1.0, num_records)).astype(int)
exercise_minutes = np.random.choice([0, 15, 30, 45, 60, 90], num_records, p=[0.4, 0.1, 0.2, 0.1, 0.1, 0.1])
break_minutes = np.random.randint(10, 120, num_records)
meetings = np.random.randint(0, 6, num_records)
social_media_minutes = np.random.normal(60, 40, num_records).clip(0, 300)
mood_score = np.random.randint(1, 11, num_records)

# Calculate derived metrics
task_completion_rate = tasks_completed / tasks_planned

# Formulate Productivity Score (0-100) using logical weights and random noise
base_prod = 50
prod_score = (base_prod +
              (sleep_hours - 7) * 4 +
              (work_hours - 6) * 2 -
              (screen_time - 5) * 3 +
              (exercise_minutes / 30) * 2 -
              (social_media_minutes / 60) * 2 +
              (mood_score - 5) * 3 +
              task_completion_rate * 15 +
              np.random.normal(0, 5, num_records))

productivity_score = np.clip(prod_score, 0, 100).round(2)

# Shift productivity score by 1 to get previous day's productivity
previous_productivity = np.roll(productivity_score, 1)
previous_productivity[0] = 70.0 # Default value for the first record

# Determine Routine Disruption Risk based on threshold logic
disruption_risk = []
for s, st, m in zip(sleep_hours, screen_time, mood_score):
    if s < 5 or st > 8 or m < 4:
        disruption_risk.append("HIGH")
    elif s < 6.5 or st > 6 or m < 6:
        disruption_risk.append("MEDIUM")
    else:
        disruption_risk.append("LOW")

# Construct the DataFrame
df = pd.DataFrame({
    'date': dates,
    'sleep_hours': sleep_hours.round(1),
    'work_hours': work_hours.round(1),
    'screen_time': screen_time.round(1),
    'tasks_planned': tasks_planned,
    'tasks_completed': tasks_completed,
    'exercise_minutes': exercise_minutes,
    'break_minutes': break_minutes,
    'meetings': meetings,
    'social_media_minutes': social_media_minutes.round(0),
    'mood_score': mood_score,
    'previous_productivity': previous_productivity,
    'productivity_score': productivity_score,
    'task_completion_rate': task_completion_rate.round(2),
    'disruption_risk': disruption_risk
})

# Save to CSV inside the data folder
file_path = 'data/dataset.csv'
df.to_csv(file_path, index=False)
print(f"Success! {num_records} records have been saved to {file_path}")