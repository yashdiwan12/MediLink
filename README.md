# Healthcare Appointment Manager

A full-stack, AI-powered healthcare appointment platform featuring separate portals for patients, doctors, and an admin. It manages the full lifecycle of a patient's visit: from AI-driven symptom triage and doctor assignment, to calendar syncing, email notifications, and AI post-visit summaries.

## Features

- **Role-based Access Control**: Separate secure portals for `PATIENT`, `DOCTOR`, and `ADMIN`.
- **AI Triage (Pre-visit)**: Patients input symptoms; an LLM categorizes the urgency, deduces the correct specialization, assigns an available doctor, and generates questions for the doctor.
- **AI Post-visit Summary**: Doctors input clinical notes; an LLM converts them into a patient-friendly summary and structured medication schedule.
- **Double-booking Prevention**: Robust slot allocation using Prisma interactive transactions.
- **Leave Conflict Resolution**: Admin marks doctors on leave, automatically cancelling conflicting appointments and notifying patients.
- **Background Job Queue**: Database-backed email queue for retries and daily medication reminders.
- **Google Calendar OAuth 2.0**: Seamless synchronization of appointments directly into the doctor's calendar.

## Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Groq API Key (for LLM)
- Google Cloud Console Project (for Calendar OAuth 2.0)

### 2. Installation
```bash
# Clone the repo and install dependencies for both frontend and backend
cd backend
npm install
cd ../frontend
npm install
```

### 3. Environment Variables (.env)
Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare?schema=public"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# AI (Groq)
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Google Calendar OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/calendar/callback"

# Email Configuration (SMTP)
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="your-email-user"
SMTP_PASS="your-email-password"
```

### 4. Database Setup
```bash
cd backend
npx prisma db push
npx prisma generate
```

### 5. Start Servers
```bash
# Terminal 1: Backend (runs on port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (runs on port 5173)
cd frontend
npm run dev
```

## AI Implementation (LLM Prompts)

We utilize the `openai/gpt-oss-20b` model via Groq for lightning-fast inference.

### Pre-Visit Prompt
```text
Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, three suggested questions for the doctor, and the most appropriate medical specialization from this list ONLY: [Cardiology, Neurology, Orthopedics, Dermatology, General Medicine, Pediatrics, Psychiatry, Diagnostic Medicine]. Symptoms: <${symptoms}>

Respond STRICTLY with valid JSON in the following format...
```

### Post-Visit Prompt
```text
Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <${notes}>

Respond STRICTLY with valid JSON in the following format...
```

## API Documentation Summary

### Auth
- `POST /api/auth/signup`: Register new user.
- `POST /api/auth/login`: Authenticate and receive JWT.

### Patient
- `POST /api/patient/appointments`: Book an appointment (triggers AI triage).
- `PATCH /api/patient/appointments/:id/cancel`: Cancel booking.
- `GET /api/patient/appointments`: View personal appointments.

### Doctor
- `GET /api/doctor/appointments`: View schedule.
- `POST /api/doctor/appointments/:id/post-visit`: Submit notes, generate AI summary, complete appointment.

### Admin
- `POST /api/admin/doctors/:id/profile`: Manage doctor profiles.
- `POST /api/admin/doctors/:id/leaves`: Mark doctor on leave (auto-cancels conflicting appointments).

### Calendar
- `GET /api/calendar/auth`: Redirects to Google consent screen.
- `GET /api/calendar/callback`: Handles OAuth callback and saves refresh token.

## Google Calendar Setup
1. Go to Google Cloud Console.
2. Enable "Google Calendar API".
3. Under "Credentials", create an OAuth 2.0 Client ID.
4. Add `http://localhost:5000/api/calendar/callback` to Authorized redirect URIs.
5. Copy Client ID and Secret to `.env`.
