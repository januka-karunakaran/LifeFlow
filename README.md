# 🚀 LifeFlow - AI-Powered Productivity Simulator & Tracker

LifeFlow is a modern, full-stack microservices application designed to track daily lifestyle metrics and use Machine Learning to predict productivity and routine disruption risks.

## ✨ Key Features
- **🤖 AI-Powered Predictions:** Predicts daily productivity scores and disruption risks using a Python FastAPI Machine Learning service.
- **📊 Advanced Analytics:** Visualizes productivity trends and metrics using responsive charts (`recharts`).
- **🔥 Gamification:** Engages users with dynamic streak tracking and achievement badges.
- **💡 AI Insights & Data Export:** Generates personalized text recommendations based on user habits and allows 1-click CSV data export.
- **🎨 Premium UI/UX:** Fully responsive Dark Theme built with Tailwind CSS and smooth transitions using Framer Motion.
- **🔐 Secure Authentication:** JWT-based user authentication and protected routes.

## 🛠️ Tech Stack
**Frontend:**
- React (Vite)
- Tailwind CSS
- Recharts (Data Visualization)
- Framer Motion (Animations)
- Axios & React Router

**Backend (Microservices Architecture):**
- **Primary API:** Node.js, Express.js
- **Machine Learning Service:** Python, FastAPI, scikit-learn
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## 🏗️ Architecture Flow
1. **Client (React):** User inputs daily metrics (sleep, screen time, etc.).
2. **Node.js Server:** Validates the request and securely stores data in MongoDB.
3. **Python ML Server:** Node.js acts as a proxy, sending the metrics to the FastAPI server.
4. **Prediction:** Python runs the pre-trained ML models and returns the predicted productivity and disruption risk back to the client via Node.js.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB connection string

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/LifeFlow.git](https://github.com/your-username/LifeFlow.git)
cd LifeFlow