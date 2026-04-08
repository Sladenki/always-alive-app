# Product Design + Frontend Refactor

## Proposed project structure

```text
src/
  app/
    providers/
      AppProviders.tsx
    routing/
      AppRouter.tsx
  config/
    navigation.ts
  components/
    layout/
      Screen.tsx
    ui/
      glass-panel.tsx
    features/
      feed/
      map/
      notifications/
      profile/
  pages/
    FeedPage.tsx
    MapPage.tsx
    MyEventsPage.tsx
    NotificationsPage.tsx
    ProfilePage.tsx
  data/
  contexts/
  hooks/
  lib/
```

## Design system

### Color and surface model

- Base palette from tokens: `--background`, `--foreground`, `--primary`, `--muted`.
- Glass surfaces:
  - `glass` for default cards
  - `glass-strong` for sticky/floating controls
  - `glass-solid` for nav and modal-heavy surfaces
- Accent semantics:
  - warm/hot = attention and urgency
  - teal = places, location, presence
  - violet = graph/network/fomo mechanics

### Typography

- Font stack: Inter + system fallback.
- Hierarchy:
  - Screen title: `text-[28px] font-semibold tracking-[-0.02em]`
  - Section label: uppercase tiny labels for temporal grouping
  - Card title: `text-[13-15px] font-semibold`
  - Metadata: `text-[10-12px] text-muted-foreground`

### Spacing and rhythm

- Screen container unified in `Screen`:
  - horizontal `px-4`
  - top `pt-8`
  - bottom `pb-28` to keep safe distance from bottom nav
- Card radius standardized around `rounded-2xl`.
- Vertical stack rhythm via `space-y-2/3/4`.

## Reusable components introduced

- `Screen`:
  - shared page shell with optional title/subtitle
  - keeps page spacing and top headers consistent
- `GlassPanel`:
  - shared “liquid glass” card primitive
  - handles interactive and strong variants
- `navigation.ts`:
  - typed tab ids and centralized nav config
  - removes duplicated tab metadata and hardcoded IDs

## UX updates applied

- Unified top hierarchy on My Events and Notifications for easier orientation.
- Consistent glass card interactions on feed live places and notifications.
- Cleaner microcopy hierarchy via screen subtitles.
- Reduced cognitive load by normalizing page paddings and panel shape language.

## Why this is better

- Better separation: routing/nav concerns are now config-driven and typed.
- Better reuse: page shell and glass panel reduce repeated class strings and drift.
- Better maintainability: visual consistency can now be updated from primitives instead of every page.
- Better product velocity: new screens can be assembled from established building blocks.
