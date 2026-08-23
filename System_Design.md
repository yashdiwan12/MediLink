# System Design: Healthcare Appointment Manager

This document outlines the architectural decisions and robust mechanisms implemented to handle edge cases, concurrency, and distributed failures in the Healthcare Appointment Manager platform.

## 1. Double-Booking Prevention (Slot Hold Mechanism)

**Problem:** In a highly concurrent environment, two patients might simultaneously attempt to book the exact same doctor for the exact same time slot. If handled naively, both requests could read the slot as "available" before either writes their booking, resulting in a double-booked doctor.

**Solution:** 
We implemented double-booking prevention at the database level utilizing **Prisma Interactive Transactions** (`prisma.$transaction`). 
When a booking request is initiated, the backend:
1. Opens an atomic transaction.
2. Queries for available doctors and checks for overlapping `SCHEDULED` appointments within the transaction context.
3. Automatically assigns the first available doctor.
4. Writes the new appointment.

Because these operations happen sequentially inside a single isolated transaction, if two identical requests arrive at the exact same millisecond, the database serializes the transactions. The first request successfully claims the slot, and the second request is forced to evaluate the newly updated state (seeing the slot as claimed), gracefully throwing a "No doctors available" error instead of double-booking.

This eliminates the need for complex, short-lived Redis "slot-hold" locks, relying instead on immediate ACID-compliant database locking to guarantee data integrity.

## 2. Doctor Leave Conflict Handling

**Problem:** A doctor may suddenly require emergency leave or vacation on a date where they already have multiple scheduled appointments.

**Solution:**
The system provides the Admin with an endpoint to mark a doctor on leave for a specific date. This triggers an automated **Leave Conflict Resolution** workflow:
1. **Identify:** The system queries the database for all `SCHEDULED` appointments assigned to that doctor on the specified leave date.
2. **Invalidate:** It executes a bulk `updateMany` operation to instantly mark all affected appointments as `CANCELLED`.
3. **Resolve Side-Effects:** The system loops through the cancelled appointments to process external side-effects:
   - It queries the Google Calendar API using the doctor's OAuth refresh token to delete the calendar events, instantly removing them from the doctor's schedule.
   - It pushes a cancellation notification to the `EmailQueue`, informing the affected patients of the emergency leave and instructing them to book a new slot.

## 3. Notification Failure Handling

**Problem:** Sending emails synchronously during an HTTP request is dangerous. If the third-party SMTP server (e.g., SendGrid, NodeMailer) is slow or temporarily down, the user's booking request will timeout, or the email will be permanently lost.

**Solution:**
We decoupled notification generation from notification delivery using a **Database-Backed Job Queue**.
1. **The Queue:** We introduced an `EmailQueue` model in the PostgreSQL database. When the application needs to send an email (e.g., a booking confirmation or cancellation), it simply inserts a `PENDING` record into the database. This database write is instantaneous, allowing the user's HTTP request to resolve immediately.
2. **The Worker:** A `node-cron` background worker runs continuously on the server, waking up every minute. It sweeps the database for up to 50 `PENDING` emails and dispatches them to the SMTP server.
3. **Graceful Retries:** If the SMTP server fails (e.g., network timeout), the worker catches the error, increments a `retries` counter on the database record, and leaves it in the queue for the next sweep. 
4. **Poison Pills:** To prevent the queue from getting permanently clogged by dead email addresses, any email that fails 3 consecutive times is explicitly marked as `FAILED` and ignored by future sweeps.

By persisting the queue in PostgreSQL, the system is immune to sudden server crashes; un-sent emails are safely stored on disk and will automatically resume processing the moment the server restarts.
