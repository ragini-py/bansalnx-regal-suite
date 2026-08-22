# Bansal-nx build conventions (read before writing any code)

Stack: TanStack Start v1 + React 19 + TypeScript + Tailwind v4. NOT Next.js.
Routes live in `src/routes/`, file-based, `createFileRoute("/exact/route/id")`.
Dots in filenames = slashes in route ids. Never edit `src/routeTree.gen.ts`.

## Hard styling rules (from the client, non-negotiable)

- Tailwind utility classes ONLY. No CSS files, no CSS modules, no
  styled-components, no `<style>` tags, **no `style={{ ... }}` anywhere**.
- Never hardcode colours (`text-white`, `bg-black`, `bg-[#...]`). Use the design
  tokens defined in `src/styles.css`: `background foreground card muted
  muted-foreground primary accent border destructive gold gold-soft gold-deep
  emerald sapphire leaf royal pearl ivory charcoal ink success warning info`.
  Utilities: `text-gold`, `bg-ink`, `border-gold`, etc.
- Fonts: `font-display` (Cormorant Garamond) for headings, default sans (Jost)
  for body. Headings already default to font-display via base styles.
- Buttons: use `<Button variant="luxe|luxeOutline|onImage|gold" size="luxe|luxeLg|luxeSm">`
  from `@/components/ui/button`. Do not add colour classes to buttons.
- Custom utilities available: `eyebrow`, `rule-gold`, `link-underline`, `fade-up`.
- Sharp corners are the house style (`--radius` is 2px). Avoid heavy shadows,
  gradients and rounded cards. Generous whitespace, thin borders, uppercase
  tracked micro-labels (`text-[11px] uppercase tracking-[0.22em]`).
- Responsive from 320px up. Design mobile deliberately.
- Accessibility: labels on inputs, `aria-*` on icon buttons, visible focus,
  never colour alone for status.

## Data + state

All mutable state comes from `useStore()` in `@/lib/store` (auth, cart,
wishlist, coupons, orders, admin catalogue/content/settings, RBAC). Static
catalogue helpers come from `@/data/catalog`; seeds/labels from `@/data/mock`;
types from `@/data/types`. Never inline new mock data in a component.

Helpers: `formatINR`, `discountPercent`, `formatDate`, `formatDateTime` from
`@/lib/format`.

Shared components (reuse, do not re-create):

- `@/components/storefront/SiteLayout` → `SiteLayout`, `PageHeader`, `Breadcrumbs`
- `@/components/storefront/ProductCard` → `ProductCard`, `ProductGrid`
- `@/components/storefront/AuthPromptDialog` → `AuthPromptDialog`
- `@/components/common/SectionHeading` → `SectionHeading`, `EmptyState`
- `@/components/common/Skeletons` → `ProductGridSkeleton`, `TableSkeleton`, …
- `@/components/common/Reveal` → `Reveal`
- `@/components/brand/BrandMark` → `BrandMark`, `PeacockGlyph`
- shadcn primitives in `@/components/ui/*` (dialog, sheet, select, tabs, table,
  badge, switch, checkbox, radio-group, accordion, separator, skeleton…)
- toasts: `import { toast } from "sonner"` (Toaster already mounted in __root)

Every storefront page wraps its content in `<SiteLayout>`. Admin pages use
`AdminLayout` from `@/components/admin/AdminLayout`.

## Search param contracts (must match exactly)

- `/products`: `{ q?: string; sort?: string; category?: string; collection?: string; size?: string; colour?: string }`
- `/login`, `/register`: `{ redirect?: string }`
- `/order/$id` uses path param only.

Declare with `validateSearch: (s: Record<string, unknown>) => ({ ... })`.

## Auth / RBAC

`useStore()` exposes `isAuthenticated`, `isAdmin`, `user`, `hasPermission(key)`,
`pendingIntent`, `setPendingIntent`. Guarded pages render an inline
"unauthorised" or sign-in state (client-side only; comment that real
enforcement must be server-side). Never gate in a loader.

## Head metadata

Every route file needs `head: () => ({ meta: [...] })` with a unique title,
description, `og:title`, `og:description`. No og:image.

## Integration honesty

Razorpay and Delhivery are NOT connected. Show integration-ready states and
never claim a live external call succeeded. COD orders are never "paid".
No inventory counts anywhere — only variant availability.
