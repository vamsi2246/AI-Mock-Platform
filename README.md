# 🎙️ AI Mock Interview Platform

> A production-ready AI-powered voice interview platform that delivers dynamic, personalized mock interviews with adaptive follow-up questions, conversation memory, and detailed feedback reports.

---

## 📖 Overview

The AI Mock Interview Platform enables candidates to practice realistic interviews through natural voice conversations with an AI interviewer.

Unlike traditional mock interview applications that rely on predefined question lists or chatbot interactions, this platform creates an adaptive interview experience by understanding candidate responses, maintaining conversation context, and generating intelligent follow-up questions.

The goal is to simulate the experience of speaking with a real interviewer while providing actionable feedback for continuous improvement.

---

# ✨ Key Features

### 🎤 Real-Time Voice Interviews

- AI-powered voice conversations
- Natural interviewer introductions
- Real-time speech recognition
- AI voice responses
- Live conversation flow
- Voice activity indicators
- AI thinking animations

---

### 🧠 Adaptive AI Conversation

The AI interviewer dynamically:

- Understands candidate responses
- Maintains conversation memory
- References previous answers
- Generates contextual follow-up questions
- Adjusts interview difficulty
- Challenges weak responses
- Explores strong answers in greater depth
- Progresses naturally through interview stages

Unlike static interview platforms, every question is generated using the entire interview context.

---

### 📄 Resume-Aware Interviews

Candidates can upload their resume.

The AI extracts:

- Skills
- Projects
- Technologies
- Experience

Interview questions are then personalized using the candidate's background.

Example:

Instead of asking generic React questions, the interviewer asks about projects actually listed in the resume.

---

### 💼 Job Description Personalization

Candidates can paste a Job Description.

The AI extracts:

- Required technologies
- Responsibilities
- Skills
- Experience

Interview questions are aligned with the target role, making the interview more realistic.

---

### 📊 AI Feedback Reports

After every interview, the platform generates a professional report containing:

- Executive Summary
- Overall Score
- Communication Analysis
- Confidence Analysis
- Technical Knowledge
- Leadership Assessment
- Problem Solving Evaluation
- STAR Framework Analysis
- Strengths
- Weaknesses
- Personalized Improvement Roadmap
- Hiring Recommendation

---

### 📈 Analytics Dashboard

Candidates can track:

- Interview History
- Average Scores
- Weekly Progress
- Interview Streak
- Skill Improvement
- Recent Reports
- Recommended Practice Areas

---

# 🏗️ System Architecture

```
                +----------------------+
                |      React App       |
                +----------+-----------+
                           |
                           |
                           ▼
                +----------------------+
                |     Express API      |
                +----------+-----------+
                           |
                           |
         +-----------------+-----------------+
         |                                   |
         ▼                                   ▼
+------------------+              +----------------------+
| Conversation AI  |              | Authentication Layer |
+------------------+              +----------------------+
         |
         ▼
+---------------------------+
| Prompt Builder            |
| Resume Context            |
| Job Description Context   |
| Conversation Memory       |
+-------------+-------------+
              |
              ▼
      +---------------+
      | Vapi + OpenAI |
      +---------------+
              |
              ▼
      +---------------+
      | SQLite DB     |
      +---------------+
```

---

# 🧠 AI Conversation Flow

```
Candidate Starts Interview
           │
           ▼
 AI Introduces Itself
           │
           ▼
 Ask First Question
           │
           ▼
 Candidate Answers
           │
           ▼
 Analyze Response
           │
           ▼
 Retrieve Conversation Memory
           │
           ▼
 Resume Context
           │
           ▼
 Job Description Context
           │
           ▼
 Generate Follow-Up Question
           │
           ▼
 Continue Until Interview Ends
           │
           ▼
 Generate Final Report
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Framer Motion
- Lucide Icons

---

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt

---

## Database

- SQLite

---

## AI

- OpenAI GPT
- Vapi Voice AI

---

# 📂 Project Structure

```
client/
│
├── components/
├── pages/
├── hooks/
├── services/
├── context/
├── utils/
└── assets/

server/
│
├── controllers/
├── routes/
├── services/
├── prompts/
├── middleware/
├── database/
└── utils/
```

---

# 🔄 Interview Lifecycle

```
Signup

↓

Profile Setup

↓

Resume Upload (Optional)

↓

Paste Job Description (Optional)

↓

Choose Interview Type

↓

System Check

↓

Voice Interview

↓

Adaptive AI Conversation

↓

Dynamic Follow-up Questions

↓

Interview Ends

↓

AI Feedback Report

↓

Dashboard History
```

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Protected API Routes
- Environment Variables
- Input Validation
- CORS Protection

---

# ⚡ Performance Optimizations

- Lazy Loading
- API Caching
- Optimized React Rendering
- Efficient Database Queries
- Modular Architecture

---

# 📱 Responsive Design

Supports:

- Desktop
- Tablet
- Mobile

---

# 🎯 Assignment Highlights

This project was designed around the assignment's primary objective:

✅ Dynamic AI Conversations

✅ Real-Time Voice Interviews

✅ Personalized Resume-Based Questions

✅ Job Description Awareness

✅ Adaptive Follow-Up Questions

✅ Conversation Memory

✅ AI Feedback Reports

✅ Premium User Experience

✅ Clean Architecture

---

# 🚀 Getting Started

## 💻 Local Development

### 1. Clone Repository & Install Dependencies
Run the unified install script from the root directory:
```bash
git clone https://github.com/vamsi2246/AI-Mock-Platform.git
cd AI-Mock-Platform
npm run install:all
```

### 2. Configure Environment Variables
* Copy `client/.env.example` to `client/.env` and update variables.
* Copy `server/.env.example` to `server/.env` and update variables.

### 3. Initialize Database & Run
To run both backend and frontend servers simultaneously in development mode:
```bash
# Push Prisma schema to SQLite
npm run prisma:push

# Run local development servers
# Server runs on port 3001, Client runs on port 5173
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2
```

---

# ☁️ Production Deployment

### 1. Frontend (React SPA) -> Vercel
Deploy the frontend client directory separately to Vercel:
* **Root Directory:** `client`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Vercel Routing:** React Router is automatically handled by the pre-configured [`client/vercel.json`](file:///Users/apple/Desktop/AI-Mock-Platform/client/vercel.json) rewrite rules.
* **Environment Variables:**
  * `VITE_API_URL`: Your deployed Render backend URL ending in `/api` (e.g., `https://ai-mock-backend.onrender.com/api`).
  * `VITE_VAPI_PUBLIC_KEY`: Your Vapi public key.

### 2. Backend (Node/Express API) -> Render
Deploy the backend server directory separately to Render as a **Web Service**:
* **Root Directory:** `server`
* **Build Command:** `npm install && npx prisma generate`
* **Start Command:** `npx prisma db push && npm start`
* **Persistent Disk (Volume):** SQLite requires a persistent disk volume to save database records and uploads between service restarts.
  * Click **Add Disk** in the Render settings.
  * **Name:** `app-data`
  * **Mount Path:** `/opt/data`
  * **Size:** `1 GB`
* **Environment Variables:**
  * `NODE_ENV`: `production`
  * `PORT`: `3001`
  * `DATABASE_URL`: `"file:/opt/data/dev.db"` (Must point to the persistent mount path!)
  * `FRONTEND_URL`: Your deployed Vercel domain (e.g., `https://ai-mock-interview.vercel.app`).
  * `JWT_SECRET` & `JWT_REFRESH_SECRET`: Random 32+ character keys.
  * `OPENAI_API_KEY`, `VAPI_API_KEY`, and `VAPI_PUBLIC_KEY`.

---

# ⚠️ Troubleshooting & Common Issues
* **"Voice Connection Error / Connection Error":** This occurs if your Vapi credentials are invalid or if your Vapi public key is not loaded. Ensure that the keys match in `server/.env`.
* **"Failed to save interview" (500 Error):** This happens when the AI report evaluator crashes. Check that your `OPENAI_API_KEY` has active billing credits at [platform.openai.com](https://platform.openai.com). If it runs out of quota (429 error), the backend automatically falls back to estimated scores and outlines quota fix instructions without crashing.
* **Database Resetting:** If you notice your user registrations or mock history disappear after a Render redeployment, ensure that you have mounted a persistent volume and that `DATABASE_URL` is pointing inside `/opt/data/`.


# 📸 Screenshots

## Landing Page

> Add Screenshot Here

---

## Dashboard

> Add Screenshot Here

---

## Interview Room

> Add Screenshot Here

---

## Feedback Report

> Add Screenshot Here

---

# 🔮 Future Improvements

- Multiple AI Interview Personas
- Coding Interview Support
- Team Interview Mode
- Company-specific Interview Templates
- Multi-language Interviews
- AI Voice Emotion Detection
- Interview Replay
- Cloud Storage Integration

---

# 👨💻 Author

**Vamsi K**

GitHub: https://github.com/vamsi2246

LinkedIn: https://linkedin.com/in/vamsi2246

---

# ⭐ Why This Project?

This project was built to demonstrate how Large Language Models and Voice AI can be combined to create realistic interview experiences.

Instead of functioning as a simple chatbot, the platform maintains conversational context, personalizes interviews using resume and job description data, adapts follow-up questions in real time, and delivers detailed AI-generated feedback—creating an experience that closely resembles a real technical or behavioral interview.
