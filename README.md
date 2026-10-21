# Vidyapith — Learning Management System

**Vidyapith** is a full-stack Learning Management System (LMS) built to bring students and instructors together in one platform. Learners can discover courses, study lessons, track progress, take quizzes, discuss course content, and earn verifiable certificates. Instructors can build and manage courses, while administrators oversee publishing, users, payments, and moderation.

Built with **Next.js 14**, **React**, **Clerk**, **Prisma**, **MySQL**, **Stripe**, **Mux**, and **UploadThing**.

> This repository contains the application source code. Before deploying it, configure the required third-party services and environment variables, apply the database schema/data migrations, and complete the verification steps below.

## Highlights

### For students
- Browse and search a paginated catalog of published courses.
- Enroll in free courses or purchase paid courses through Stripe Checkout.
- Access course content based on enrollment and successful payment state.
- Learn through video, article, text, and mixed-format lessons.
- Resume lessons using saved video positions and lesson progress.
- Create private lesson notes and bookmarks.
- Access lesson resources and course attachments.
- Take quizzes with scoring, passing thresholds, and attempt limits.
- Participate in course discussions and replies.
- Submit course reviews, receive notifications, and earn certificates after meeting course completion rules.
- Verify certificates through a public verification page.

### For instructors
- Create and edit courses, chapters, lessons, and course metadata.
- Add video, written content, resources, attachments, announcements, and quizzes.
- Configure lesson requirements, completion policies, and prerequisite courses.
- Manage instructor/editor assignments with course-scoped permissions.
- Review learner rosters and course analytics.
- Submit courses for administrator review before publication.

### For administrators
- Manage user roles with safeguards around administrator and course-owner changes.
- Review, approve, reject, and archive courses.
- Manage categories and moderate course reviews and discussions.
- Inspect payment records and manage certificate revocation or reinstatement.
- Review audit logs and platform statistics.

## Technology stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 App Router |
| UI | React 18, Tailwind CSS, Radix UI, shadcn-style components, Lucide |
| Authentication | Clerk |
| Database | MySQL |
| ORM and schema | Prisma |
| Payments | Stripe Checkout and signed webhooks |
| Video | Mux with server-generated signed playback tokens |
| File uploads | UploadThing |
| Validation | Zod |
| Forms and state | React Hook Form, Zustand |
| Tests | Node.js built-in test runner |

## Architecture and security

- **Role-based access control:** database-backed `STUDENT`, `TEACHER`, and `ADMIN` roles are checked on the server.
- **Course-level permissions:** ownership, editor, and instructor permissions are handled separately from global roles.
- **Server-side course access checks:** lesson and learning-tool APIs validate enrollment or successful purchase; client-side UI state is not treated as authorization.
- **Stripe webhook verification:** webhook signatures are verified, and payment events are tracked to avoid processing the same event more than once.
- **Refund handling:** refunded purchases revoke associated course access.
- **Protected video playback:** Mux signed playback tokens are generated server-side. The signing private key must never be exposed to browser code.
- **Input validation and rate limits:** Zod validates core mutation payloads, with a lightweight in-process limiter for selected operations.
- **Auditability:** important administrative, payment, publication, moderation, completion, and certificate changes can be recorded in audit logs.

**Deployment note:** the included rate limiter is intended for a single application instance. For a horizontally scaled deployment, replace it with a shared rate-limiting service. Use reviewed Prisma migrations in production rather than `prisma db push`.

## Getting started

### Prerequisites

- Node.js and npm (use a version compatible with the Next.js and Prisma dependencies)
- A MySQL database
- Clerk application credentials
- Stripe API and webhook credentials
- Mux credentials for signed video playback
- UploadThing credentials

### 1. Clone and install

```bash
git clone https://github.com/yadavsonur/vidyapith.git
cd vidyapith
npm install
```

### 2. Configure environment variables

Create a local `.env` file using `.env.example` as the reference. Populate it with your own development credentials:

```dotenv
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# Stripe
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# Mux signed playback
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY_ID=
MUX_PRIVATE_KEY=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Initial administrator bootstrap
RBAC_BOOTSTRAP_ADMIN_ID=
```

Use the exact variable names and any additional settings documented in `.env.example`. Keep secrets private: **never commit `.env`, API keys, webhook secrets, or private signing keys.**

### 3. Generate and synchronize Prisma

```bash
npx prisma validate
npx prisma generate
npx prisma db push
```

The `db push` command is intended here for local development where appropriate. If you are connecting an existing database, back it up first and review the schema/data migration plan before changing it.

### 4. Run LMS migration and verification

```bash
npm run lms:migrate
npm run lms:verify
```

These scripts initialize/normalize LMS data and check key integrity assumptions. Review their behavior and the target database before running them against real user data.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the built application |
| `npm run lint` | Run the Next.js lint command |
| `npm test` | Run the Node.js test suite |
| `npx prisma validate` | Validate the Prisma schema |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma studio` | Open Prisma Studio |
| `npm run lms:migrate` | Run LMS data migration/bootstrap logic |
| `npm run lms:verify` | Check LMS data integrity |
| `npm run mux:migrate-signing` | Add signed playback IDs to legacy Mux assets |

## Payments and webhooks

Stripe Checkout initiates paid-course purchases, but access should be granted from verified server-side payment state—not from a success redirect alone. The webhook endpoint verifies the `Stripe-Signature` header and uses stored payment-event identifiers for idempotent processing.

The implementation handles checkout completion, payment failures, and refunds. Configure the deployed Stripe webhook endpoint with the correct `STRIPE_WEBHOOK_SECRET`, then test successful purchases, duplicate webhook deliveries, failures, and refunds before launch.

## Protected Mux playback

Mux assets use signed playback for protected lessons. The application creates short-lived playback JWTs on the server using the configured signing key.

For legacy assets, the repository includes:

```bash
npm run mux:migrate-signing
```

The migration preserves existing public playback IDs by default so that signed playback can be verified first. Only remove legacy public playback IDs after the signed playback migration has been tested successfully. Keep all Mux secrets and private signing keys server-side.

## Production checklist

Before deploying:

1. Configure all production environment variables through your hosting provider's secret manager.
2. Use a reviewed Prisma migration workflow and take a database backup before schema/data changes.
3. Run `npm test`, `npm run lint`, `npx prisma validate`, `npx prisma generate`, and `npm run build`.
4. Run `npm run lms:migrate` and `npm run lms:verify` where appropriate for the target database.
5. Configure and verify Clerk authentication, Stripe webhook delivery, UploadThing, and Mux signed playback.
6. Test student enrollment, purchase, refund, course access, lesson progress, quizzes, completion, and certificate verification.
7. Test instructor authoring/submission and administrator publishing/moderation workflows.
8. Replace the in-process rate limiter with shared infrastructure if running multiple app instances.
9. Confirm `.env` and all credentials are excluded from version control.

Runtime checks that depend on external services and a configured database must be completed in your own development or CI environment; a successful source checkout alone does not confirm a production deployment.

## Project structure

```text
app/          Next.js App Router pages and API routes
actions/      Server-side actions
components/   Reusable UI components
hooks/        React hooks
lib/          Authentication, permissions, validation, and shared services
prisma/       Prisma schema and database configuration
scripts/      LMS migration, verification, and Mux migration scripts
tests/        Automated tests
public/       Static assets
```

## Contributing

1. Fork the repository and create a feature branch.
2. Make focused changes and add or update tests where applicable.
3. Run the test, lint, schema validation, and build commands.
4. Open a pull request describing the change and any migration or configuration requirements.

## Author

**Sonu Yadav**  
GitHub: [@yadavsonur](https://github.com/yadavsonur)

---

Vidyapith is an evolving project. Feature availability and deployment readiness should be validated against the current code and configured services.
