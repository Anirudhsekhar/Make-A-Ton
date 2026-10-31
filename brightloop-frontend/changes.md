# Brightloop frontend change log

Append a new dated entry for every implementation task. Never overwrite previous entries.

## 2026-10-31 — Phase 1: Admin layout + dashboard overview

### Files added
- `src/config/adminNav.js`
- `src/data/admin/overviewDemoData.js`
- `src/services/admin/overviewService.js`
- `src/hooks/useAdminOverview.js`
- `src/lib/adminFormat.js`
- `src/components/admin/AdminLayout.jsx`
- `src/components/admin/AdminSidebar.jsx`
- `src/components/admin/AdminTopbar.jsx`
- `src/components/admin/AdminPageHeader.jsx`
- `src/components/admin/Panel.jsx`
- `src/components/admin/StatCard.jsx`
- `src/components/admin/StatusBadge.jsx`
- `src/components/admin/SampleDataBadge.jsx`
- `src/components/admin/SampleDataNotice.jsx`
- `src/components/admin/AdminState.jsx`
- `src/components/admin/RevenueChart.jsx`
- `src/components/admin/RecentSubscriptions.jsx`
- `src/pages/admin/AdminOverview.jsx`
- `src/pages/admin/AdminModulePlaceholder.jsx`
- `changes.md`

### Files modified
- `src/App.jsx`

### Functional / UI changes
- Added a light editorial admin shell using the tokens in `assets/DESIGN.md`: fixed desktop sidebar, mobile drawer with overlay, sticky topbar, and a responsive content container.
- Added admin navigation for Overview, Staff, Products, Plans, Taxes, and Discounts. Profile identity, verified role badge, and logout are available in the sidebar.
- Replaced the admin dashboard placeholder with a Phase 1 overview: four metric cards, revenue chart, recent subscriptions list, and a clear sample-data notice.
- Added reusable admin primitives: layout, page header, panel, metric card, status badge, sample-data badge/notice, loading/empty/error states, revenue chart, and subscriptions list.
- Added route-level placeholders for future admin modules so navigation and nested routing are integration-ready without implementing those pages.
- Preserved all existing login, signup, forgot-password, Firebase auth, role verification, and customer/staff routes. All admin routes remain inside the existing verified-admin `ProtectedRoute`.
- Overview loads through an isolated async demo adapter and includes loading, empty, error, and retry states.

### Demo-only behavior
- All overview figures, revenue points, and recent subscriptions come from `src/data/admin/overviewDemoData.js` through `src/services/admin/overviewService.js`.
- The page is explicitly labelled as sample data. Nothing is persisted, and no financial or customer data is real.
- No endpoint URLs, Firebase collections, billing logic, tax logic, or client-side permission checks were invented.

### Tests / build
- `npm run lint` — passed with no warnings.
- `npm run build` — passed (Vite 8.3.5, 2088 modules transformed).
- No preview server was started.

### Outstanding integration TODOs
- Replace the demo overview adapter with the agreed FastAPI endpoint and confirm the response contract, currency, identifiers, and date formats with Thowfeek and Devananda.
- Confirm server-enforced admin role verification end-to-end. The existing trusted profile service is still pending, so no admin access is granted while verification is unavailable.
- Map real API error/empty states and pagination for recent subscriptions.
- Implement Staff, Products, Plans, Taxes, and Discounts in later phases.
- Complete manual visual QA across mobile, tablet, and desktop breakpoints when a preview is approved.

## 2026-10-31 — Admin Preview Mode (development only)

### Files added
- `src/config/adminPreview.js`
- `src/components/admin/AdminPreviewRoute.jsx`
- `src/components/admin/DemoModeBadge.jsx`

### Files modified
- `src/App.jsx`
- `src/components/admin/AdminSidebar.jsx`
- `src/components/admin/AdminTopbar.jsx`
- `.env`
- `.env.example`
- `changes.md`

### Functional / UI changes
- Added a development-only admin preview guard. `/admin/dashboard` and the other nested admin routes render without a Firebase session only when Vite is in development mode and `VITE_ENABLE_ADMIN_PREVIEW=true`.
- Added `AdminPreviewRoute`, which falls back to the existing verified-admin `ProtectedRoute` whenever preview mode is disabled. Existing Firebase authentication, role verification, and customer/staff routes were not changed.
- Added a small amber `DEMO MODE` badge in the admin topbar. The sidebar identifies the preview workspace, shows a mock admin identity, and replaces logout with an exit-to-login action so preview mode never calls Firebase sign-out.
- Reused the existing isolated overview demo dataset for dashboard cards, the revenue chart, and the recent subscriptions list. No new Firebase collections, documents, or records are created.
- Added `VITE_ENABLE_ADMIN_PREVIEW=true` to the local `.env` and documented the flag as `false` in `.env.example`.

### Demo-only behavior
- Preview mode is gated by both `import.meta.env.DEV` and `VITE_ENABLE_ADMIN_PREVIEW`. Vite compiles `import.meta.env.DEV` to `false` in production, so the preview route and badge are removed from production bundles even if the flag is set.
- Mock identity and dashboard values live outside the Firebase/auth services. Preview data remains sample data only and is not persisted.

### Tests / build
- `npm run lint` — passed.
- `npm run build` — passed (Vite 8.3.5, 2091 modules transformed).
- Verified the production bundle does not contain the `DEMO MODE` label or `VITE_ENABLE_ADMIN_PREVIEW` flag.
- No preview server was started.

## 2026-10-31 — Fix admin preview guard order

### Files modified
- `src/config/adminPreview.js`
- `src/components/auth/ProtectedRoute.jsx`
- `src/components/admin/AdminPreviewRoute.jsx`
- `changes.md`

### Functional / UI changes
- Centralized the development preview check inside `ProtectedRoute` and moved it ahead of the session loader, unauthenticated redirect, and verified-role checks.
- Admin routes now bypass authentication in development only when both `import.meta.env.DEV` is truthy and `import.meta.env.VITE_ENABLE_ADMIN_PREVIEW === 'true'`.
- The preview bypass applies only to routes guarded with the `admin` role. Customer and staff routes continue to require verified Firebase profiles even when the preview flag is set.
- Simplified `AdminPreviewRoute` to delegate to the existing admin `ProtectedRoute`, removing the duplicate bypass so there is a single source of truth.
- Existing Firebase authentication, role verification, and admin UI were not changed.

### Demo-only behavior
- Preview mode remains development-only. `import.meta.env.DEV` is compiled to `false` in production builds, so production authentication is still fully enforced even if the flag is left set.
- No preview data is persisted and no Firebase records are created.

### Tests / build
- `npm run lint` — passed.
- `npm run build` — passed (Vite 8.3.5, 2091 modules transformed).
- Verified the production bundle omits the `DEMO MODE` label and `VITE_ENABLE_ADMIN_PREVIEW` flag.
- Verified in the Vite development transform that the preview flag evaluates to `true` and the `ProtectedRoute` admin bypass is present.
- No preview server was started.

## 2026-10-31 — Fix local Admin Preview Mode

### Files added
- None

### Files modified
- `src/config/adminPreview.js`
- `src/components/auth/ProtectedRoute.jsx`
- `src/components/admin/AdminPreviewRoute.jsx`
- `changes.md`

### Functional / UI changes
- Admin preview is enabled only when `import.meta.env.DEV` is truthy and `import.meta.env.VITE_ENABLE_ADMIN_PREVIEW === 'true'`.
- `ProtectedRoute` now returns its outlet before the session loader, unauthenticated redirect, and profile/role checks when preview mode is active for the admin area.
- `/admin/dashboard` and every nested admin route render without a Firebase login or verified profile in local development.
- The preview bypass is scoped to admin guards and the `/admin` path. Customer and staff routes keep their normal Firebase authentication and profile verification behavior.
- `AdminPreviewRoute` delegates to the existing admin `ProtectedRoute`, keeping a single authorization path.
- Existing admin UI is preserved. The amber `DEMO MODE` badge remains in the admin topbar, and the sidebar shows the mock preview identity with an exit-to-login action.
- Dashboard metrics, revenue chart, and recent subscriptions continue to use the existing isolated demo dataset.

### Demo-only behavior
- Production builds compile `import.meta.env.DEV` to `false`, so the preview bypass and `DEMO MODE` badge cannot become active in production even if `VITE_ENABLE_ADMIN_PREVIEW` is left set.
- No Firebase records are created, and no preview data is persisted.

### Tests / build
- `npm run lint` — passed.
- `npm run build` — passed (Vite 8.3.5, 2091 modules transformed).
- Verified the production bundle does not contain `DEMO MODE`, `VITE_ENABLE_ADMIN_PREVIEW`, or the preview workspace labels.
- No preview server was started.

### Outstanding integration TODOs
- None related to this fix.

## 2026-10-31 — Dedicated development-only demo route (`/demo/admin`)

### Files added
- `src/config/demoMode.js`

### Files modified
- `src/App.jsx`
- `src/components/admin/AdminLayout.jsx`
- `src/components/admin/AdminSidebar.jsx`
- `src/components/admin/AdminTopbar.jsx`
- `src/components/admin/DemoModeBadge.jsx`
- `changes.md`

### Functional / UI changes
- Added `/demo/admin` and nested demo routes for Overview, Staff, Products, Plans, Taxes, and Discounts. They render the existing admin layout, sidebar, topbar, overview page, and module placeholders without Firebase authentication or profile verification.
- Demo routes are registered only when `import.meta.env.DEV` is true. Production routes, `ProtectedRoute`, Firebase auth, role verification, and customer/staff routes are unchanged.
- The sidebar rewrites its navigation to stay under `/demo/admin/...`, shows a demo admin identity, and labels the workspace as a dev-only demo. The existing admin preview behavior remains intact for `/admin` when its environment flag is enabled.
- `AdminLayout`, `AdminSidebar`, and `AdminTopbar` accept an optional `demo` prop so the same components serve both verified admin and demo routes.
- The topbar always shows the amber `DEMO MODE` badge on demo routes. The overview page continues to use the existing sample-data notice and demo adapter.

### Demo-only behavior
- `DEMO_MODE_ENABLED` is derived from `import.meta.env.DEV`, which Vite compiles to `false` in production, so the demo routes are not registered in production builds.
- Demo dashboard figures still come from `src/data/admin/overviewDemoData.js`. Nothing is persisted and no Firebase records are created.
- The sidebar's demo session action navigates to `/login` without calling Firebase sign-out.

### Tests / build
- `npm run lint` — passed with no warnings.
- `npm run build` — passed (Vite 8.3.5, 2092 modules transformed).
- Verified the production bundle does not register a `/demo/admin` route; only the shared demo config constants remain because the layout components import them.
- No preview server was started.

### Outstanding integration TODOs
- Replace the demo overview adapter with the agreed FastAPI endpoint when available.
- Confirm server-enforced admin role verification end-to-end for the real `/admin` routes.
