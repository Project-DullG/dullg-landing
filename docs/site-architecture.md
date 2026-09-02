# Site architecture

## Responsibilities

- `app/`: route composition, metadata, and page-specific copy.
- `components/`: reusable UI and interactive behavior.
- `lib/`: typed, public content used by more than one route.
- `public/assets/`: locally hosted source images and downloadable files.

## Content sources

- `lib/site-config.ts`: brand name, email, response time, and business number.
- `lib/navigation.ts`: primary and studio navigation.
- `lib/works.ts`: every public work and its detail-page metadata.
- `lib/funding.ts`: funding periods, official URLs, and verified figures.
- `lib/activities.ts`: chronological public activity records.
- `lib/education.ts`: curriculum facts and student course materials.

Pages should import these sources instead of copying their values. Content that is not approved for publication must not be added to these collections.

## Styling

- `app/globals.css`: established site-wide design system and legacy page styles.
- `app/activity.css`: activity list and activity case pages.
- `app/work-detail.css`: work detail pages.
- `app/responsive.css`: cross-page mobile interaction guarantees.

New route-specific styles should live in a clearly named file and be imported once from `app/layout.tsx`. Avoid adding another catch-all block to `globals.css`.

## Adding content

1. Add a work to `lib/works.ts`; its detail route and sitemap entry are generated automatically.
2. Add a funding record to `lib/funding.ts`, then reference it by id where required.
3. Add a student resource to `courseMaterials` in `lib/education.ts`.
4. Add a public timeline entry to `activityRecords` in `lib/activities.ts`.
5. Run lint, build, rendered HTML tests, prohibited-content search, and responsive browser checks before deployment.
