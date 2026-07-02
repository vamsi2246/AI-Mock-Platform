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

## Clone Repository

```bash
git clone https://github.com/vamsi2246/AI-Mock-Platform.git
```

## Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

## Configure Environment Variables

### Client

```env
VITE_API_URL=http://localhost:3001
VITE_VAPI_PUBLIC_KEY=
```

### Server

```env
OPENAI_API_KEY=
JWT_SECRET=
DATABASE_URL="file:./dev.db"
VAPI_PRIVATE_KEY=
```

---

## Run Backend

```bash
cd server
npx prisma db push
npm run dev
```

---

## Run Frontend

```bash
cd client
npm run dev
```

---

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
