# System Design: MediLink — Healthcare Appointment Manager

## Overview

MediLink is a multi-tenant healthcare scheduling platform built around three distinct user roles (Patient, Doctor, Admin), an AI triage engine, and a reliable asynchronous notification layer. This document details the critical architectural decisions governing slot management, conflict resolution, and notification resilience.

---

## 1. Double-Booking Prevention & Slot Hold Mechanism

### The Problem

In any concurrent booking system, a classic race condition exists: two patients can simultaneously query a slot as "available", both proceed to book it, and both writes succeed — resulting in a double-booked doctor. Standard read-then-write patterns are insufficient at scale.

### The Solution: Database-Level Atomic Transactions

Rather than introducing an external lock store (e.g., Redis), we solved this entirely at the database layer using **Prisma Interactive Transactions** (`prisma.$transaction`).

When a booking request arrives, the entire slot allocation flow is wrapped in a single atomic unit:

1. **Query** — Fetch all doctors matching the AI-deduced specialization, filtering out any on leave for the requested date.
2. **Conflict Check** — Within the same transaction context, query for any `SCHEDULED` appointments overlapping the requested time window for those doctors.
3. **Assign** — Select the first doctor not present in the conflict set.
4. **Write** — Create the appointment record, atomically committing the slot claim.

Because PostgreSQL serializes concurrent transactions at the row level, if two identical requests arrive simultaneously, the second transaction is forced to re-evaluate state after the first commits — it observes the slot as taken and responds with a `400 No doctors available` rather than creating a conflicting record. No external coordination service is required.

---

## 2. Doctor Leave Conflict Handling

### The Problem

A doctor granted leave on a future date may already have multiple confirmed patient appointments. Simply recording the leave without resolving downstream conflicts creates silent scheduling failures.

### The Solution: Cascading Conflict Resolution

When an Admin marks a doctor on leave via `POST /api/admin/doctors/:profileId/leaves`, the system executes a three-phase conflict resolution workflow:

**Phase 1 — Identify:** Query all `SCHEDULED` appointments for that doctor on the leave date, eagerly loading patient contact details and associated Google Calendar event IDs.

**Phase 2 — Invalidate:** Perform a bulk `updateMany` in a single database round-trip, setting all affected appointments to `CANCELLED`.

**Phase 3 — Resolve Side-Effects:** For each affected appointment, two async side-effects are triggered without blocking the admin response:
- **Calendar Cleanup:** The doctor's stored OAuth refresh token is used to call the Google Calendar API and delete the associated event, keeping the doctor's schedule accurate in real time.
- **Patient Notification:** A cancellation email is enqueued in the `EmailQueue` table, informing the patient of the leave and directing them to rebook.

This ensures that the admin action is fast and transactional, while the expensive external calls (calendar API, SMTP) are decoupled and handled reliably in the background.

---

## 3. Notification Failure Handling & Email Retry Queue

### The Problem

Sending emails synchronously within an HTTP request lifecycle creates two failure modes: (1) if the SMTP provider is slow, the user's request hangs; (2) if the server crashes mid-send or the SMTP provider is unreachable, the email is silently lost with no mechanism to recover it.

### The Solution: Database-Backed Asynchronous Email Queue

Notifications are fully decoupled from the request/response cycle via a persistent **EmailQueue** backed by PostgreSQL.

**Enqueue Phase:** Any part of the system that needs to send an email (booking confirmation, post-visit summary, leave cancellation, medication reminder) calls `sendEmail()`, which simply inserts a `PENDING` record into the `EmailQueue` table. This is a fast database write that never blocks the user-facing response.

**Delivery Phase:** A `node-cron` background worker runs every minute. It sweeps the queue for up to 50 `PENDING` records and attempts SMTP delivery for each. On success, the record is marked `SENT`. On failure, the `retries` counter is incremented and the record remains `PENDING` for the next sweep.

**Dead-letter Handling:** Any email that fails three consecutive delivery attempts is marked `FAILED` and excluded from future sweeps. This prevents a single bad email address or transient SMTP error from clogging the queue indefinitely.

**Crash Resilience:** Because the queue is persisted in PostgreSQL rather than held in memory, an unexpected server restart has zero impact on notification delivery. All `PENDING` emails are automatically picked up when the server comes back online.

A second cron job runs at 08:00 daily to sweep completed appointments with active medication schedules and enqueue personalized medication reminder emails for each patient.

---

## Architecture Summary

| Concern | Mechanism |
|---|---|
| Concurrent Slot Booking | Prisma `$transaction` (PostgreSQL serialization) |
| Leave Conflict Resolution | Cascading bulk cancel + async side-effects |
| Email Delivery | DB-backed `EmailQueue` with cron worker |
| Email Retries | Increment-and-retry, max 3 attempts |
| Calendar Sync | Google Calendar API with per-doctor OAuth2 refresh tokens |
| LLM Failure | `try/catch` with graceful fallback defaults |
| Role Enforcement | JWT middleware + `authorizeRole()` per route |
