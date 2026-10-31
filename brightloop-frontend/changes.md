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
