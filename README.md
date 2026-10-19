# Vidhyapith

Vidhyapith is a production-oriented Next.js 14 App Router Learning Management System using Clerk for identity, Prisma/MySQL for application data, Stripe for payments, Mux for protected video playback, and UploadThing for file ingestion.it is bridge gap between students and teacher.

## Implemented LMS scope

### Student
- Clerk sign-in/sign-up with database-backed `STUDENT` / `TEACHER` / `ADMIN` authorization.
- Public published-course catalog with search, category, instructor, price, rating, popularity, and pagination.
- Free enrollment and Stripe checkout for paid courses.
- Enrollment/purchase access checks on lesson, quiz, notes, bookmark, discussion, resource, and completion APIs.
- Resume state with per-lesson completion and video playback position.
- Video, article, text, and mixed lessons.
- Private lesson notes and bookmarks.
- Lesson resources and course-level attachments.
- Quizzes with question types, deterministic scoring, passing threshold, and maximum-attempt enforcement.
- Configurable completion policy, required lessons, required quizzes, and prerequisite courses.
- Exactly one certificate per learner/course when server-side completion rules are satisfied.
- Public certificate verification and revocation support.
- Course reviews with one review per learner/course and moderation-aware rating aggregation.
- Course discussions with thread replies, closed/hidden states, and moderation.
- Notifications with deduplication and read state.

### Teacher
- Course creation/editing, publishing workflow, chapter ordering, preview access, pricing, attachments, announcements, and instructor assignments.
- Lesson-type configuration, required/optional lessons, written content, duration, video upload, and per-lesson resources.
- Quiz builder with required-for-completion flag and attempt configuration.
- Completion-rule editor and prerequisite API.
- Learner roster and course analytics endpoints/pages.
- Instructor profile editing.

### Admin
- User role management with safeguards that prevent removing the last administrator or demoting a course owner without reassignment.
- Course review and governance: approve, reject, draft, archive.
- Category create/rename/delete with safe deletion checks.
- Review moderation and discussion moderation.
- Payment ledger and certificate revocation/reinstatement.
- Platform audit log and operational statistics.

## Architecture and authorization

The application uses two layers of authorization:

1. Global role checks (`STUDENT`, `TEACHER`, `ADMIN`) in `lib/auth.js`.
2. Course-scoped permissions (`OWNER`, `EDITOR`, `INSTRUCTOR`) in `lib/permissions.js`.

Server-side APIs never trust a client-supplied user ID, role, course owner, or resource owner. Course and child-resource IDs are always scoped back to their parent course before mutation.

Payment access is granted only for `Purchase.status = SUCCEEDED` or `Enrollment.status IN (ACTIVE, COMPLETED)`. A refund changes the purchase to `REFUNDED`, cancels enrollment, writes an audit event, and notifies the learner.

## Protected Mux playback

New Mux assets are created with signed playback policy. The application signs short-lived RS256 playback JWTs on the server and passes only the resulting token to the client. The Mux signing key and private key are never exposed to browser code.

Required production secrets:

```text
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_SIGNING_KEY_ID
MUX_PRIVATE_KEY
```

For legacy Mux assets, run:

```bash
npm run mux:migrate-signing
```

That command adds a signed playback ID and updates `MuxData.playbackId`. It deliberately preserves existing public playback IDs by default so that production migration can be verified safely. After signed playback is confirmed, run the same command with `MUX_REMOVE_PUBLIC_PLAYBACK=1` to remove the old public playback IDs.

## Data model additions

The Prisma schema now includes dedicated domains for:

- course status and publication lifecycle
- completion rules and prerequisites
- lesson types and chapter resources
- student profiles
- progress/resume state
- private notes and bookmarks
- certificates
- discussions and replies
- notifications
- payment-event idempotency
- audit logs
- review moderation state

The legacy `Attachement` model name is intentionally preserved for backward compatibility with the existing database.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and supply your own secrets.

3. Generate the Prisma client:

```bash
npx prisma generate
```

4. For a local/development database where the existing schema is already established, synchronize the schema:

```bash
npx prisma db push
```

5. Initialize legacy users, course ownership assignments, completion rules, publication status, and successful purchase enrollments:

```bash
npm run lms:migrate
```

6. Verify the migrated model and integrity checks:

```bash
npm run lms:verify
```

7. Start the application:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production database workflow

For a fresh production database, use a reviewed Prisma migration rather than `db push`:

```bash
npx prisma migrate dev --name initial_lms
npx prisma migrate deploy
```

For an existing production database, take a backup, review the schema diff generated from the current production schema, apply that migration during a controlled release, then run:

```bash
npm run lms:migrate
npm run lms:verify
npm run mux:migrate-signing
```

Do not run `prisma db push` as the normal production deployment workflow.

## Stripe webhook workflow

The Stripe webhook route verifies the `Stripe-Signature` header before processing any event.

The `PaymentEvent` table provides webhook idempotency. Repeated delivery of the same Stripe event does not create another purchase/enrollment. A failed processing attempt remains retryable because an event is considered complete only after its `processedAt` timestamp is set.

Handled events include:

- `checkout.session.completed`
- `charge.refunded`
- `payment_intent.payment_failed`

The checkout record is unique per `(userId, courseId)`. Refunds revoke access and do not re-grant access if a stale checkout-completed event is delivered afterward.

## Completion and certificate workflow

Course completion is always evaluated on the server. The evaluator checks published lessons, required lessons, minimum progress, and required quizzes according to the course completion policy.

A zero-lesson course cannot complete accidentally.

When completion succeeds:

1. enrollment becomes `COMPLETED` with a stable completion timestamp;
2. the learner gets exactly one certificate using the unique `(userId, courseId)` constraint;
3. completion and certificate notifications are deduplicated;
4. an audit record is written.

The public verification endpoint returns only non-sensitive credential information and rejects revoked credentials.

## Rate limiting and validation

Mutation endpoints use Zod schemas for core payload validation and a lightweight in-process rate limiter for high-frequency operations such as progress updates and checkout creation.

The limiter is intentionally dependency-free. It is suitable for a single application instance; horizontally scaled production deployments should replace `lib/rate-limit.js` with a shared Redis/upstash-style limiter before relying on it as a security boundary.

## Tests and verification

Run the following before a release:

```bash
npm test
npm run lint
npx prisma validate
npx prisma generate
npm run build
npm run lms:verify
```

The repository's automated unit tests currently cover:

- course-role permissions and authorization matrices
- progress percentage edge cases
- quiz scoring rules
- RS256 Mux signed-playback token claims and verification
- mutation rate-limit behavior

The environment used for this repository review did not contain a complete installable dependency cache, so `npm install` could not be completed offline and therefore the full Next.js lint/build and Prisma CLI gates must be rerun in a normal networked development/CI environment.

## Initial administrator bootstrap

The one-time migration/bootstrap process uses `RBAC_BOOTSTRAP_ADMIN_ID`. If the variable is omitted, the project falls back to the administrator ID configured in the existing migration/auth code.

Do not use the bootstrap ID as the runtime authorization source; runtime role checks use the application's `User.role` value.

## Useful commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npx prisma studio
npx prisma validate
npx prisma generate
npx prisma db push
npm run lms:migrate
npm run lms:verify
npm run mux:migrate-signing
```

## Operational notes

- Never commit `.env` or Mux/Stripe/Clerk private keys.
- Keep `MUX_PRIVATE_KEY` server-only.
- Use a verified Stripe webhook endpoint in production; never trust checkout success redirects as proof of payment.
- Keep Mux public playback IDs disabled for paid content after the signed playback cutover is verified.
- Use database backups before data migrations or destructive moderation operations.
- Audit-log administrative, payment, publication, moderation, completion, and certificate state changes.
