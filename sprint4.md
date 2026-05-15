# Implementation Plan — Sprint 4: Booking Flow & Payments

Goal: Complete the end-to-end booking journey from slot selection to confirmed Google Calendar event.

## User Review Required

> [!IMPORTANT]
> **Razorpay Credentials**: I will need the following environment variables set in `.env.local` (local only, do not push):
> - `RAZORPAY_KEY_ID`
> - `RAZORPAY_KEY_SECRET`
> - `RAZORPAY_WEBHOOK_SECRET`
> 
> **SMTP for Emails**: Ensure the existing Firebase/SMTP configuration is active for confirmation emails.

## Proposed Changes

### 1. Booking Step 2: Session Brief Form

#### [NEW] [details/page.tsx](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/app/%28mentor-connect%29/mentor-connect/book/%5Bslug%5D/%5BsessionId%5D/details/page.tsx)
- Server component to render the "Session Brief" page.
- Validates the `slot` query parameter and session/mentor details.

#### [NEW] [BookingDetailsForm.tsx](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/components/mentor-connect/BookingDetailsForm.tsx)
- Client component with a textarea for `founder_brief`.
- Collects founder info and triggers the payment process.

### 2. Razorpay Integration

#### [NEW] [razorpay.ts](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/lib/razorpay.ts)
- Initialize Razorpay SDK singleton.

#### [NEW] [booking.ts](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/lib/actions/booking.ts)
- **Server Action: `initiateBooking`**:
    1. Validates user session.
    2. Inserts a `pending_payment` session into the `sessions` table.
    3. Creates a Razorpay Order.
    4. Returns `order_id` and session ID.

### 3. Webhook & Background Logic

#### [NEW] [route.ts](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/app/api/webhooks/razorpay/route.ts)
- POST handler for Razorpay webhooks.
- Verifies `x-razorpay-signature`.
- On `payment.captured` or `order.paid`:
    1. Update session status to `confirmed`.
    2. Call `createSessionEvent`.
    3. Send confirmation emails.

#### [NEW] [calendar-booking.ts](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/lib/mentor/calendar-booking.ts)
- **`createSessionEvent(sessionId: string)`**:
    - Fetches session and mentor (with tokens).
    - Refreshes Google token if expired.
    - Creates `calendar#event` with `conferenceDataVersion: 1` for Google Meet.
    - Updates `sessions.google_meet_link`.

### 4. Step 4: Confirmation

#### [NEW] [success/page.tsx](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/app/%28mentor-connect%29/mentor-connect/book/success/page.tsx)
- Success page showing the Google Meet link and appointment details.

### 5. Founder Dashboard

#### [MODIFY] [ProfileView.tsx](file:///Users/himanshusah/Documents/Marketing/StartupGrants%20Website/Start/grantsindia/src/components/profile/ProfileView.tsx)
- Add "My Sessions" tab.
- Fetch and display the user's mentor sessions (upcoming/past).

## Verification Plan

### Automated Tests
- Razorpay Webhook Simulation: Use `curl` or Postman to send a signed mock webhook to the local endpoint.
- Calendar Verification: Book a session and verify the event appears on the mentor's Google Calendar with a Meet link.

### Manual Verification
1. Select a slot.
2. Fill the brief.
3. Complete payment (using Razorpay Test Mode).
4. Verify redirection to success page.
5. Check email (if SMTP is configured).
6. Check `/profile` for the new session.
