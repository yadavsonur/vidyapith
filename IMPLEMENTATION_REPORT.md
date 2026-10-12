# Vidhyapith — Final Engineering Report

Date: 2026-10-07

## 1. What was implemented

The repository was extended from the existing Vidhyapith LMS foundation into a substantially more complete full-stack LMS. The implementation covers student learning flows, teacher course authoring, multi-teacher authorization, course review/publishing workflow, quizzes and completion rules, notes/bookmarks/resources, discussion/Q&A, notifications, certificates and public verification, Stripe purchase state/idempotency/refunds, Mux signed playback, admin moderation/governance, audit logging, migration/verification scripts, validation, and lightweight rate limiting.

The implementation deliberately preserves the existing JavaScript/JSX architecture and legacy model names/behavior where possible. No database reset or destructive automatic migration was performed.

## 2. Files/modules added or substantially changed

Major additions/changes include:

- `prisma/schema.prisma` — expanded LMS domain model and indexes.
- `lib/auth.js`, `lib/permissions.js` — role/course-scoped authorization paths.
- `lib/validation.js` — Zod request validation schemas.
- `lib/rate-limit.js` — dependency-free mutation limiter.
- `lib/audit.js`, `lib/notifications.js` — shared audit/notification services.
- `lib/course-access.js` — centralized course access decision logic.
- `lib/services/completion.js` — server-side completion evaluator/finalizer and certificate issuance.
- `lib/mux.js` — server-only signed playback JWT generation.
- Student lesson/progress/learning-tool components and APIs.
- Course resources, discussions, notifications, certificates, reviews, quizzes, prerequisites, completion-rules, and payment routes.
- Admin course governance, user-role, category, review, discussion, payment, certificate, audit, and stats surfaces.
- Teacher resource editor, completion rules, learner/analytics, quiz authoring, and instructor-management surfaces.
- `scripts/migrate-lms.js`, `scripts/verify-lms.js`, `scripts/migrate-mux-signing.js`.
- `tests/mux.test.js`, `tests/rate-limit.test.js` plus existing authorization/progress/quiz tests.
- `.env.example` and production-oriented `README.md`.

## 3. Prisma schema changes

The schema now includes: course publication status/review metadata, completion rules, prerequisites, lesson types, chapter content/duration/required state, chapter resources, student profiles, video resume fields, review moderation state, quizzes with required-for-completion state, private notes, bookmarks, certificates, discussions, notifications, Stripe payment events, and audit logs.

Critical uniqueness/index constraints include one enrollment per learner/course, one purchase per learner/course, one review per learner/course, one certificate per learner/course, one bookmark per learner/chapter, unique Stripe identifiers, unique payment-event IDs, and indexes for course ownership, catalog filtering, enrollments, progress, resources, discussions, notifications, audits, and related foreign-key access paths.

## 4. Migration strategy

Two migration layers are provided:

1. Prisma schema migration: use a reviewed Prisma migration in controlled environments. Development can use `npx prisma db push` where appropriate; production should use a reviewed `prisma migrate` workflow rather than `db push`.
2. Data migration: `npm run lms:migrate` maps legacy users/courses, bootstraps ownership/instructor relationships, creates student profiles/completion rules, normalizes legacy published/review state, and reconstructs enrollment state from successful purchases. `npm run lms:verify` checks key integrity invariants.

Mux migration is separate and intentionally non-destructive by default: `npm run mux:migrate-signing` adds signed playback IDs to legacy assets and preserves the old public ID until the signed cutover has been manually verified.

## 5. API changes

New/extended server APIs cover:

- student profile, notes, bookmarks, learning progress, completion, certificates and verification;
- course resources, prerequisites, completion rules, discussions/replies, announcements, reviews, quizzes/questions/attempts;
- paid checkout, free enrollment, Stripe webhooks, payment history;
- notifications;
- teacher instructor assignments and course governance;
- admin roles, courses, categories, review/discussion moderation, payments, certificates, audit log, and platform stats.

Child resource identifiers are scoped back to their owning course/quiz/thread before mutation to prevent cross-course ID tampering.

## 6. Student features

Students can browse a paginated catalog, free-enroll or pay for published paid courses, access protected course content, resume video lessons from a saved position, complete video/article/text/mixed lessons, write private notes, bookmark lessons, download/view lesson resources, take scored quizzes with passing thresholds and attempt limits, satisfy configurable completion policies, use prerequisite courses, participate in discussions, submit moderated reviews, receive deduplicated notifications, receive exactly one certificate per completed course, and verify certificates publicly.

## 7. Instructor features

Teachers can create/edit courses, manage metadata/pricing, structure chapters, set lesson type/content/duration/required state, add resources, manage quizzes/questions, configure completion rules and prerequisites, manage announcements, manage co-instructors/editors under course-scoped permissions, inspect learners, inspect course analytics, and maintain instructor profiles.

Publishing is now an explicit review workflow: non-admin teaching users submit a complete course for administrator review; administrators approve/reject/archive it. Teachers cannot self-publish a course that is pending review.

## 8. Admin features

Administrators can manage global user roles, govern course publication state, moderate reviews/discussions, manage categories, review payments, revoke/reinstate certificates, inspect audit events, and view platform statistics. User-role changes protect the last remaining administrator and prevent student demotion of a user who still owns courses.

## 9. Security changes

Server-side authorization is enforced independently of UI state. Runtime authorization is based on the database-backed role and course-scoped permission matrix rather than a client-supplied role. Direct API calls still require the same permissions as the UI.

Paid access is granted only from successful purchase state or active/completed enrollment. Refunded purchases cancel enrollment access. Notes, bookmarks, progress, discussions, resources, quiz attempts, and completion APIs enforce course access. Quiz student retrieval was also hardened so quiz structure is not exposed to unauthorized users.

Mux playback tokens are generated server-side from a private RSA signing key. The private key and token credentials are not sent to the browser. New assets use signed playback policy.

Mutation payloads for core domains use Zod validation, and high-frequency operations such as progress/checkouts are rate limited. The rate limiter is explicitly documented as single-instance only and should be replaced with shared infrastructure for horizontally scaled production.

## 10. Payment changes

Stripe checkout now records a single pending purchase per `(userId, courseId)` and uses Clerk's primary email when creating the Stripe customer/session. Webhooks are signature-verified and tracked in `PaymentEvent`. Repeated delivery of the same event is idempotent after successful processing; an unprocessed event remains retryable.

Handled flows include checkout completion, refund, and payment failure. Refunds move the purchase to `REFUNDED`, cancel enrollment, write audit state, and notify the learner. A stale checkout-success delivery cannot re-grant access after a refund.

## 11. Testing performed

Final automated unit test run:

```text
Tests: 10
Passed: 10
Failed: 0
```

Coverage includes RBAC/permission matrices, progress calculations, quiz scoring, RS256 Mux token generation/claims/signature validation, and rate limiting.

A repository-wide syntax pass also parsed 230 `.js`/`.jsx` files with 0 parse diagnostics. No `.ts` or `.tsx` files were introduced.

Integration/E2E database-backed tests were not executed in this environment because the repository did not have a complete dependency/Prisma runtime installation.

## 12. Build/lint/test results

- `npm test`: PASS — 10/10.
- JavaScript/JSX syntax check: PASS — 230 files, 0 parse diagnostics.
- `npm run lint`: NOT RUN SUCCESSFULLY — failed to start because `next` is not installed/available in the uploaded environment (`exit code 127`).
- `npm run build`: NOT RUN SUCCESSFULLY — failed to start because `next` is not installed/available (`exit code 127`).
- Prisma validation/generation: NOT RUN SUCCESSFULLY — no usable local Prisma CLI was available; the attempted offline dependency installation was blocked by a missing cached `@uploadthing/shared` package.
- Earlier `npm install` attempt also timed out in the provided environment.

These failures are environment/dependency availability limitations, not reported as successful checks.

## 13. Unresolved limitations

1. A normal networked install/CI environment is still required to run the full Next.js lint/build and Prisma validation/generation gates.
2. Database-backed integration tests and browser E2E tests have not been executed here.
3. The in-process rate limiter is not suitable as a sole security boundary across multiple application instances.
4. Existing Mux public playback IDs remain public until the owner completes the signed-playback cutover and explicitly reruns the migration with `MUX_REMOVE_PUBLIC_PLAYBACK=1`.
5. The current resource URLs are access-controlled at the application API layer; production-grade private object delivery should additionally use storage-provider signed URLs if the underlying file store is intended to be private.
6. No automatic production Prisma SQL migration was fabricated because the actual database schema/Prisma CLI was unavailable for generating and validating it.

## 14. Exact manual steps required by the project owner

1. Create a `.env` from `.env.example`; supply real Clerk, MySQL, Stripe, Mux, and UploadThing secrets.
2. Use a normal networked Node/npm environment and run `npm ci` (or `npm install` if lockfile policy requires it).
3. Run `npx prisma validate` and `npx prisma generate`.
4. Back up the database before applying schema/data changes.
5. Apply a reviewed Prisma migration in production (do not use `db push` as the production deployment mechanism).
6. Run `npm run lms:migrate` and then `npm run lms:verify`.
7. Configure the Stripe webhook endpoint and `STRIPE_WEBHOOK_SECRET`; test a successful checkout, duplicate webhook delivery, failed payment, and refund.
8. Configure the Mux signing key and private key; run `npm run mux:migrate-signing`, verify signed playback, then rerun with `MUX_REMOVE_PUBLIC_PLAYBACK=1` only after successful cutover.
9. Bootstrap/verify an administrator using `RBAC_BOOTSTRAP_ADMIN_ID`.
10. Run lint/build and browser smoke/E2E tests before production release.

## 15. Environment variables that must be configured

At minimum:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
DATABASE_URL
STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET
MUX_TOKEN_ID
MUX_TOKEN_SECRET
MUX_SIGNING_KEY_ID
MUX_PRIVATE_KEY
UPLOADTHING_SECRET
UPLOADTHING_APP_ID
RBAC_BOOTSTRAP_ADMIN_ID (recommended explicit production value)
```

The exact optional public Clerk sign-in URLs remain documented in `.env.example`.

## 16. Migration commands that must be run

Development/local existing schema:

```bash
npx prisma validate
npx prisma generate
npx prisma db push
npm run lms:migrate
npm run lms:verify
```

Production/release workflow:

```bash
npx prisma migrate dev --name initial_lms
npx prisma migrate deploy
npm run lms:migrate
npm run lms:verify
npm run mux:migrate-signing
```

The production Prisma migration must be reviewed against the actual target database before deployment.

## 17. Final recommended deployment sequence

1. Build in CI from a clean checkout with the lockfile and secrets supplied through the CI secret store.
2. Run `npm test`, `npm run lint`, `npx prisma validate`, `npx prisma generate`, and `npm run build`.
3. Back up the production MySQL database.
4. Apply the reviewed Prisma migration.
5. Run `npm run lms:migrate` and `npm run lms:verify`.
6. Deploy the application.
7. Configure/verify Stripe webhook delivery and exercise idempotent checkout/refund flows.
8. Configure Mux signing and run the legacy signed-playback migration; only remove public playback IDs after verification.
9. Smoke-test student purchase/access/resume/quiz/completion/certificate, teacher authoring/submission, and admin approval/moderation flows.
10. Monitor application/audit/payment logs during the first release window and keep the pre-migration backup until the rollout is confirmed healthy.

## Verification status

The codebase is substantially integrated and source-validated. The remaining gates are environment-dependent runtime validation (Prisma/Next install, lint/build, real database integration, and browser E2E). No deployment was performed.
