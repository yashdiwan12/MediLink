# Healthcare Appointment & Follow-up Manager - System Design

## 1. Concurrency & Slot Conflicts (Double-Booking Prevention)
To safely prevent double-booking when multiple patients attempt to book the exact same time slot simultaneously, the system utilizes **Interactive Database Transactions** provided by Prisma (`prisma.$transaction`).
- When a booking request arrives, the API initiates a protected transaction.
- **Step A:** It queries the `DoctorProfile` and `Leave` tables to ensure the doctor is not on leave on the requested date.
- **Step B:** It queries the `Appointment` table for any `SCHEDULED` appointments for that specific doctor and time slot.
- **Step C:** If a conflict is detected, the transaction rolls back, and the patient receives a `400 Bad Request` explaining the slot is taken. 
- **Step D:** If the slot is free, the appointment is safely inserted. 
Because these checks and the insertion happen within a unified database transaction, race conditions are mathematically eliminated at the database locking level.

## 2. Doctor Leave Conflict Management
When an admin marks a doctor as on leave for a specific date, a conflict resolution algorithm is immediately triggered:
- The system inserts the new `Leave` record.
- It then executes a bulk query to identify all `SCHEDULED` appointments belonging to that doctor on the specified date.
- Using a bulk update operation, those identified appointments are forcefully transitioned to a `CANCELLED` status.
- **Notification Hook:** As the appointments are cancelled, the system triggers the email notification service to immediately alert the affected patients, advising them to reschedule.

## 3. Notification Reliability & Failure Handling
Given that network operations (SMTP servers) can fail or time out, the notification system is built for resilience:
- **Asynchronous Execution:** Emails are dispatched asynchronously ("fire-and-forget" from the main event loop) so they do not block API responses.
- **Retry Mechanism:** The `sendEmail` service employs an automatic recursive retry pattern. If the SMTP server rejects the connection or times out, the system waits 5 seconds and retries (up to 3 times).
- **Graceful Degradation:** If all retries are exhausted, the error is logged, but the application continues functioning. The appointment remains booked, ensuring core business logic is unaffected by third-party outages.

## 4. LLM Integration & Prompt Quality
The application integrates the Groq API (running the rapid Llama3 model) for both pre-visit and post-visit summaries.
- **Pre-visit Prompt:** *"Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: <symptoms>"*
- **Post-visit Prompt:** *"Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>"*
- **Output Enforcement:** The SDK is strictly configured with `response_format: { type: 'json_object' }`. The prompts explicitly command the LLM to return valid JSON matching a specific schema, allowing direct database insertion without messy string parsing.
- **Failure Handling:** If the Groq API times out or hallucinates invalid JSON, the service catches the exception and returns a pre-defined fallback object (e.g., `urgencyLevel: 'Unknown'`). This ensures the booking or completion process never crashes due to AI instability.

## 5. Database Schema Design
The PostgreSQL database is managed via Prisma ORM for type safety and easy migrations.
- **User Model:** Serves as the central auth table with an `Enum` for Roles (`ADMIN`, `DOCTOR`, `PATIENT`).
- **DoctorProfile Model:** A 1-to-1 extension of the User model storing `workingHours` (JSON) and `specialization`.
- **Leave Model:** A 1-to-Many relation with DoctorProfile to track days off.
- **Appointment Model:** The core transactional table linking a Patient (User) and Doctor (User). It utilizes native `DateTime` types and stores the AI-generated context (`symptoms`, `patientSummary`, `medicationSchedule` as JSON). 

## 6. API Design & Code Structure
The backend is structured using Node.js, Express, and TypeScript.
- **Middleware:** `auth.ts` validates JWTs and authorizes users based on Role-Based Access Control (RBAC).
- **Domain Routing:** APIs are strictly segregated by actor (`/api/admin`, `/api/patient`, `/api/doctor`).
- **Service Layer:** Third-party integrations (AI, Calendar, Email) are abstracted into the `src/services/` directory. This keeps the route handlers lean and allows easy mocking during testing.
- **Background Jobs:** A `node-cron` job resides in `src/jobs/reminders.ts`, running daily to scan the DB for completed appointments with active medication schedules and dispatching email reminders.

## 7. Google Calendar Integration
Google Calendar syncing occurs automatically after a successful booking.
- To prevent slowing down the HTTP response, the calendar sync is triggered asynchronously.
- It utilizes `googleapis` and OAuth 2.0 to insert an event into the primary calendar.
- The `googleEventId` is returned and stored in the database, which allows for future updates or deletions if the appointment is rescheduled or cancelled.
