# Vidhyapith Tier-1 LMS Setup

## 1. Configure environment

Create a local `.env` from `.env.example` and provide your existing Clerk, MySQL, Mux, Stripe and UploadThing values.

The requested initial administrator is:

```text
user_3H26c55ljZpSP1Ybm5ovXhyD2b8
```

## 2. Install and generate Prisma Client

```bash
npm install
npx prisma generate
```

## 3. Apply the new LMS schema

For a development database:

```bash
npx prisma db push
```

For a production workflow, generate/review a migration and deploy it with Prisma Migrate rather than treating `db push` as the production deployment mechanism.

## 4. Initialize existing data

```bash
npm run lms:migrate
```

This initializes existing course owners as teachers, the configured administrator as admin, owner assignments in `CourseInstructor`, and enrollments for existing purchases.

## 5. Verify data

```bash
npm run lms:verify
```

This prints counts for users/roles, courses, instructor assignments, enrollments, purchases, reviews, quizzes, attempts and announcements without printing secrets.

For visual database inspection:

```bash
npx prisma studio
```

## 6. Run the application

```bash
npm run dev
```

Then open `http://localhost:3000`.

## 7. Validate before commit/deployment

```bash
npm test
npm run lint
npm run build
```

`npm test` uses Node's built-in test runner, so the test suite does not require a separate test framework.

## Main LMS routes

- `/` — My Learning / public landing page
- `/search` — course catalog and filters
- `/my-courses` — enrolled courses
- `/payments` — payment history
- `/instructors/[userId]` — public instructor profile
- `/teacher/courses` — teacher course management
- `/teacher/profile` — instructor profile editor
- `/teacher/analytics` — teacher analytics
- `/teacher/courses/[courseId]/quizzes` — quiz management
- `/admin` — admin dashboard
- `/admin/users` — role management

## Role behavior

Global roles:

- `STUDENT`
- `TEACHER`
- `ADMIN`

Course roles:

- `OWNER`
- `EDITOR`
- `INSTRUCTOR`

Authentication is handled by Clerk. Authorization is handled by the application's database-backed RBAC and course-level permission layer.
