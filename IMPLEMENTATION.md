# Hidepath — AI Implementation Overview

## 1. Purpose

Hidepath is an installable Progressive Web App that guides a complete beginner through leathercraft projects from purchasing the correct tools and materials to completing a physical product.

The first MVP supports one project: **a hand-stitched leather card holder**.

The product is not an e-shop, a video-course catalogue, or a social network. It is a step-by-step personal coach. At every moment, the user should understand:

1. where they are,
2. what they need,
3. what to do next,
4. how to verify that the step was completed correctly.

Use Czech as the primary UI and content language. Show the common English leathercraft term as secondary information where useful.

## 2. Primary user journey

The complete MVP journey is:

1. User opens the app and chooses the card-holder project.
2. User reviews the required tools and materials.
3. User marks each item as `want_to_buy`, `ordered`, or `owned`.
4. Owned items appear in **Moje dílna**.
5. User prepares their workspace.
6. User completes short practice lessons on scraps.
7. User creates the card holder using a printable 1:1 PDF template.
8. User completes checkpoints and records progress.
9. App recommends the next step or explains which missing tool blocks it.

## 3. MVP scope

### Required screens

- onboarding / project selection,
- dashboard,
- shopping list,
- tool or material detail,
- workshop inventory,
- project overview,
- lesson detail optimized for mobile use.

### Required capabilities

- installable PWA,
- authentication with magic link,
- persistent shopping and inventory states,
- persistent lesson and checkpoint progress,
- project readiness calculation,
- lesson locking based on required equipment and prerequisite lessons,
- offline access to a previously downloaded project,
- offline checkpoint and inventory updates,
- synchronization when connectivity returns,
- visible online/offline and synchronization status,
- printable/downloadable project template.

### Explicit non-goals

Do not implement these in the MVP:

- payments or subscriptions,
- marketplace or checkout,
- community features,
- ratings or comments,
- AI photo evaluation,
- custom CMS or admin application,
- native mobile application,
- complex multi-user realtime collaboration,
- offline video downloads,
- a separate Node.js/NestJS backend,
- Redux or Zustand unless a demonstrated requirement appears.

## 4. Approved technology stack

- React with Vite
- TypeScript with strict mode
- React Router
- Tailwind CSS
- shadcn/ui primitives customized with the supplied Hidepath design tokens
- TanStack Query for remote server state
- React Hook Form and Zod
- `vite-plugin-pwa` and Workbox
- IndexedDB through Dexie for structured offline data
- Supabase PostgreSQL
- Supabase Auth using email magic links
- Supabase Storage for project images, user photos, and PDF templates
- Supabase CLI and SQL migrations
- Vitest and React Testing Library
- Playwright for end-to-end tests
- Vercel or Cloudflare Pages for deployment

Do not introduce Next.js. This product is an interactive authenticated PWA and does not currently require SSR or SEO rendering.

## 5. Design direction

Follow the approved warm, editorial leathercraft direction:

- warm canvas background,
- parchment secondary surfaces,
- near-black dark leather text,
- cognac primary accent,
- forest green success and owned states,
- muted brass for ordered/warning states,
- serif display headings,
- sans-serif controls and instructional text,
- restrained 8–16 px radii,
- subtle construction lines and leather-pattern references,
- large real photography when assets become available.

Avoid western styling, fake leather textures on every component, excessive pill shapes, glossy metal effects, and generic SaaS-dashboard styling.

Touch targets must be at least 44 × 44 px. The mobile lesson must be usable while a phone lies on a workshop table. Sticky actions must respect the safe area and never cover content.

## 6. Suggested routes

```text
/
/login
/onboarding
/dashboard
/shopping
/shopping/:toolSlug
/workshop
/projects/:projectSlug
/projects/:projectSlug/lessons/:lessonSlug
/offline
```

Protect authenticated application routes. Preserve a return URL through the magic-link login flow.

## 7. Content architecture

Shared instructional content belongs in the repository, not initially in PostgreSQL. Store long-form lessons as MDX and metadata as typed TypeScript objects validated with Zod.

```text
src/content/
├── tools/
├── materials/
└── projects/
    └── card-holder/
        ├── project.ts
        ├── 01-prepare-workspace.mdx
        ├── 02-straight-cut.mdx
        ├── 03-stitching-chisels.mdx
        ├── 04-saddle-stitch.mdx
        ├── 05-transfer-and-cut.mdx
        ├── 06-assemble-card-holder.mdx
        └── card-holder-template.pdf
```

Suggested core types:

```ts
type EquipmentPriority = 'required' | 'recommended' | 'later';
type EquipmentStatus = 'want_to_buy' | 'ordered' | 'owned';
type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface EquipmentRequirement {
  equipmentSlug: string;
  priority: EquipmentPriority;
  reason: string;
  specification: string;
  alternatives?: string[];
}

interface CheckpointDefinition {
  slug: string;
  title: string;
  description?: string;
  required: boolean;
}

interface LessonDefinition {
  slug: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  requiredEquipment: string[];
  prerequisiteLessons: string[];
  checkpoints: CheckpointDefinition[];
}

interface ProjectDefinition {
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: { min: number; max: number };
  equipment: EquipmentRequirement[];
  lessons: LessonDefinition[];
  templateUrl?: string;
  contentVersion: number;
}
```

Do not silently invent leathercraft facts. Treat initial instructional copy as draft content that requires domain review.

For the demo project, consistently use stitching chisels with approximately **3.85 mm spacing** and waxed thread around **0.6 mm**.

## 8. Cloud database

Use UUID primary keys and `timestamptz` timestamps. Add `created_at` and `updated_at` to mutable tables. Generate TypeScript database types from Supabase.

### `profiles`

- `id` — UUID, primary key, references `auth.users.id`
- `display_name` — nullable text
- timestamps

### `project_enrollments`

- `id` — UUID
- `user_id` — UUID
- `project_slug` — text
- `content_version` — integer
- `status` — `active | completed | archived`
- `started_at`
- `completed_at` — nullable
- unique `(user_id, project_slug)`

### `inventory_items`

- `id` — UUID generated by the client so offline inserts are idempotent
- `user_id` — UUID
- `equipment_slug` — text
- `status` — `want_to_buy | ordered | owned`
- `purchase_price_cents` — nullable integer
- `currency` — default `CZK`
- `shop_name` — nullable text
- `purchased_at` — nullable date
- `notes` — nullable text
- `photo_path` — nullable text
- timestamps
- unique `(user_id, equipment_slug)`

### `lesson_progress`

- `id` — UUID generated by the client
- `user_id` — UUID
- `project_slug` — text
- `lesson_slug` — text
- `status` — `available | in_progress | completed`
- `started_at` — nullable
- `completed_at` — nullable
- timestamps
- unique `(user_id, project_slug, lesson_slug)`

Do not persist `locked`; derive it from prerequisites and owned equipment.

### `checkpoint_progress`

- `id` — UUID generated by the client
- `user_id` — UUID
- `project_slug` — text
- `lesson_slug` — text
- `checkpoint_slug` — text
- `completed` — boolean
- timestamps
- unique `(user_id, project_slug, lesson_slug, checkpoint_slug)`

### `project_photos` — optional after the core flow

- `id` — UUID
- `user_id` — UUID
- `project_enrollment_id` — UUID
- `lesson_slug` — nullable text
- `storage_path` — text
- `caption` — nullable text
- timestamps

Enable Row Level Security on every user-data table. Policies must restrict select, insert, update, and delete operations to `auth.uid() = user_id`. Storage policies must similarly restrict personal uploads.

## 9. Business rules

### Equipment readiness

- `owned` counts as ready.
- `ordered` means on the way and does not count as ready.
- `want_to_buy` counts as missing.
- Only `required` equipment can block a lesson.
- `recommended` and `later` equipment never block progress.

### Lesson availability

A lesson is available only when:

1. every prerequisite lesson is completed, and
2. every required equipment item for that lesson has status `owned`.

If blocked, show the reason and a direct action to the relevant shopping item. Do not allow users to mark a blocked lesson as complete.

### Progress

Calculate overall progress from completed required tasks/checkpoints, not from visited screens or unlocked phases.

Keep separate values for:

- overall project progress,
- current phase progress,
- equipment readiness.

Use one shared domain function for these calculations; do not duplicate progress logic in UI components.

### Budget

- Remaining budget is the sum of estimated prices for items not owned.
- Show required and recommended subtotals separately.
- An ordered item remains in outstanding cost until an actual purchase price is recorded, but label it as ordered.
- In the workshop, say `Evidované náklady`, not simply `Investováno`, when prices are incomplete.

## 10. PWA and offline behavior

The MVP is **offline-capable**, not a fully general offline-first collaboration system.

### Cache with the service worker

- app shell, JavaScript, CSS, fonts and icons,
- project metadata,
- lesson MDX output,
- optimized lesson images,
- downloaded PDF template,
- explicit offline fallback page.

Use an explicit **Stáhnout projekt offline** action. Do not automatically cache every future project. Show an estimated download size and downloaded content version.

Suggested Workbox strategies:

- application assets: precache,
- versioned lesson content: cache first,
- lesson images: cache first with expiration,
- Supabase reads: network first with a short timeout and local fallback,
- external shopping links: network only,
- video: network only in the MVP.

### Store locally in IndexedDB

- downloaded project metadata and content version,
- inventory state,
- lesson progress,
- checkpoint progress,
- pending mutations,
- last successful synchronization timestamp.

### Synchronization queue

Every offline-capable write must:

1. update IndexedDB immediately,
2. update the UI optimistically,
3. append an idempotent mutation to the local outbox,
4. attempt synchronization if online,
5. retain failed mutations with an error state,
6. retry when connectivity returns or the app starts,
7. remove the mutation only after confirmed success.

Suggested outbox shape:

```ts
interface PendingMutation {
  id: string;
  userId: string;
  entity: 'inventory' | 'lesson_progress' | 'checkpoint_progress';
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: unknown;
  createdAt: string;
  attempts: number;
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}
```

Use client-generated UUIDs and database upserts to make retries idempotent. For the MVP, use last-write-wins based on `updated_at`. Do not add a complex CRDT system.

The app must visibly display:

- `Vše synchronizováno`,
- `Offline`,
- `N změn čeká na synchronizaci`,
- synchronization failure with a retry action,
- new application version available.

Do not promise indefinite offline authentication. Offline use is supported after an authenticated user has previously opened and downloaded the project on the device.

## 11. Suggested source organization

```text
src/
├── app/
│   ├── router.tsx
│   └── providers.tsx
├── components/
│   ├── ui/
│   ├── equipment/
│   ├── lessons/
│   ├── projects/
│   └── sync/
├── content/
├── features/
│   ├── auth/
│   ├── inventory/
│   ├── progress/
│   ├── projects/
│   ├── shopping/
│   └── sync/
├── lib/
│   ├── db/
│   ├── pwa/
│   ├── supabase/
│   └── validation/
├── pages/
├── styles/
└── test/

supabase/
├── migrations/
└── seed.sql

public/
├── icons/
├── images/
└── templates/
```

Keep domain logic outside React components. UI components should consume computed view models rather than reproduce readiness, locking, or progress rules.

## 12. Implementation order

### Milestone 1 — application foundation

- initialize Vite React TypeScript project,
- configure linting, formatting, tests and path aliases,
- integrate Hidepath tokens and base components,
- configure routing and responsive application shell,
- configure PWA manifest, icons and service worker,
- implement an offline fallback page.

### Milestone 2 — static vertical slice

- encode the card-holder project and six lessons,
- implement dashboard, shopping, workshop, project and lesson routes,
- reproduce the approved design with placeholder imagery,
- implement pure readiness, locking and progress functions,
- verify mobile lesson ergonomics.

### Milestone 3 — Supabase persistence

- create migrations and RLS policies,
- implement magic-link authentication,
- persist enrollment, inventory, lessons and checkpoints,
- generate and use typed database definitions.

### Milestone 4 — offline data

- create Dexie schema,
- cache/download the project,
- implement local-first reads for downloaded content,
- implement optimistic local writes and the outbox,
- add reconnect/startup synchronization,
- add visible sync status and retry controls.

### Milestone 5 — quality and deployment

- accessibility review,
- unit tests for all business rules,
- E2E tests for the primary journey,
- PWA install/offline/update testing on desktop and a real mobile device,
- production build and deployment.

Do not attempt all milestones in a single uncontrolled change. Keep the app runnable and tests passing after every milestone.

## 13. Minimum test coverage

Unit-test at least:

- readiness for every equipment status,
- required versus recommended blocking behavior,
- prerequisite lesson locking,
- progress calculations,
- remaining-budget calculations,
- idempotent outbox creation,
- successful and failed synchronization retries.

Playwright must cover:

1. login or an authenticated test fixture,
2. choosing the card-holder project,
3. changing an item from wanted to ordered to owned,
4. observing the resulting lesson unlock,
5. completing all required lesson checkpoints,
6. refreshing and retaining progress,
7. loading a downloaded lesson without network connectivity,
8. making an offline change and synchronizing it after reconnection.

## 14. Definition of done for the MVP

The MVP is complete when a first-time user can:

- install Hidepath on a supported device,
- authenticate,
- understand the card-holder project and its requirements,
- manage the complete shopping list,
- see owned tools in their workshop,
- understand exactly why a lesson is available or locked,
- complete lesson checkpoints,
- retain progress after refresh and on another online device,
- download the project and use its lessons offline,
- record progress offline and later synchronize it,
- download and print the 1:1 template,
- complete the primary journey without encountering placeholder navigation or dead actions.

The production build, automated tests, database migrations, RLS policies, and README setup instructions must all be present and passing.

## 15. Instructions for the implementing AI agent

1. Read this document and inspect the approved design/prototype before editing code.
2. Check the repository and existing conventions; preserve unrelated user work.
3. Present a short implementation plan before large changes.
4. Build the smallest complete vertical slice first.
5. Do not invent new product scope or redesign approved screens without explaining the need.
6. Do not fabricate live shop URLs, prices, leathercraft claims, photographs, or instructional safety information.
7. Use realistic Czech UI copy; do not use lorem ipsum.
8. Keep domain rules pure, typed, shared, and tested.
9. Treat service-worker updates and stale cached content as explicit UX states.
10. Never expose Supabase service-role keys in the client. Only public client configuration may be shipped to the browser.
11. Enable and test RLS before considering persistence complete.
12. Run type checking, unit tests, E2E tests where practical, and a production build before handoff.
