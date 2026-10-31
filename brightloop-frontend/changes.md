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

## 2026-10-31 — Implement all five Admin modules

### Files added
- `src/data/admin/adminDemoData.js`
- `src/context/AdminDemoDataContext.jsx`
- `src/hooks/useAdminBasePath.js`
- `src/components/admin/AdminButton.jsx`
- `src/components/admin/AdminField.jsx`
- `src/components/admin/AdminModal.jsx`
- `src/components/admin/AdminDataTable.jsx`
- `src/components/admin/StatusToggle.jsx`
- `src/components/admin/AdminConfirmDialog.jsx`
- `src/components/admin/AdminSummaryCards.jsx`
- `src/components/admin/AdminFlashMessage.jsx`
- `src/pages/admin/AdminStaff.jsx`
- `src/pages/admin/AdminProducts.jsx`
- `src/pages/admin/AdminPlans.jsx`
- `src/pages/admin/AdminTaxes.jsx`
- `src/pages/admin/AdminDiscounts.jsx`

### Files modified
- `src/App.jsx`
- `src/components/admin/AdminLayout.jsx`
- `changes.md`

### Functional / UI changes
- Added full Staff, Products & Variants, Subscription Plans, Taxes, and Discounts modules for both `/admin/...` and development-only `/demo/admin/...` routes.
- Replaced the five admin module placeholders with working list pages: page headers, summary cards, search/filter toolbars, responsive desktop tables and mobile card rows, empty states, status toggles and row actions.
- Added reusable admin primitives for compact labels/inputs/selects/textareas, buttons, modals, data tables, confirmation dialogs, status switches, summary cards and demo update messages.
- Added functional Add/Edit forms with client-side validation:
  - Staff: required name/email, valid email, duplicate email check, password policy (more than 8 characters, uppercase, lowercase, special character), fixed Internal Staff role, Active/Inactive status.
  - Products: required name/type, nonnegative sales and cost prices, numeric variant adjustments, multiple add/remove variant rows and computed selling price per variant.
  - Plans: required product link, nonnegative price, billing period, minimum quantity >= 1, date range validation and four policy toggles (auto-close, early close, pause, renew).
  - Taxes: required name, numeric rate restricted to 0–100, description, status and a sample $1,000 calculation preview.
  - Discounts: fixed/percentage value validation, minimum purchase or quantity, date range, optional positive usage limit, selected-product or whole-subscription applicability and an eligibility summary.
- Added demo CRUD interactions: create and edit records, activate/deactivate staff, products, plans, taxes and discounts, and delete plans with a confirmation dialog.
- Products show their related plan count, flag products without a plan as **Needs plan**, and link to the Plans module with the product pre-filled in the Add Plan form.
- Preserved the existing admin shell, sidebar, topbar, navigation structure, design tokens, responsive behavior, Login/Signup/Forgot Password, Firebase services, customer/staff routes and production admin guard.

### Demo-only behavior
- All module data comes from `src/data/admin/adminDemoData.js` and is held in `AdminDemoDataContext` local component state inside the existing admin layout; changes reset on reload and are never written to Firebase or FastAPI.
- Every page keeps the existing sample-data badge/notice language. New records use stable generated IDs and realistic sample values.
- Staff initial passwords are only used for local validation. They are not stored in the staff records, lists, context state or logs; the field is cleared when the dialog closes.
- Product-to-plan navigation rewrites to the current admin base path, so demo links stay under `/demo/admin/plans`.
- No Firebase collections, backend endpoints, billing calculations or server permissions were invented or modified.

### Tests / build
- `npm run build` — passed (Vite 8.3.5, 2107 modules transformed). The existing large-chunk advisory remains.
- `npm run lint` — completed with no errors. Remaining warnings: existing unused `firebaseUser` parameter in `src/services/userProfileService.js` and two fast-refresh export warnings in `src/context/AdminDemoDataContext.jsx`.
- No development or preview server was started.

### Outstanding integration TODOs
- Wire each module to the agreed FastAPI CRUD endpoints and confirm schemas, identifiers, currency, date formats, pagination and error contracts with Thowfeek.
- Implement privileged staff creation through the backend/Firebase Admin SDK (Auth user + trusted staff profile); keep plaintext passwords out of the client after submission.
- Confirm Firestore profile/role schema and server-enforced admin authorization with Devananda.
- Add real persistence and replace the local demo provider once API adapters are available.
- Enforce product-plan referential integrity and the publish/activation rule on the server; keep the frontend Needs plan workflow aligned.
- Move tax calculations, discount eligibility, expiry, usage tracking and invoice application fully into the backend.
- Add integration-level loading, error, retry and pagination handling for each list once endpoints exist.

## 2026-10-31 — Customer Portal + development-only `/demo/customer`

### Files added
- `src/config/customerNav.js`
- `src/config/customerDemo.js`
- `src/hooks/useCustomerBasePath.js`
- `src/data/customer/customerDemoData.js`
- `src/services/customer/customerService.js`
- `src/lib/customerFormat.js`
- `src/lib/customerInvoicePdf.js`
- `src/context/CustomerPortalContext.jsx`
- `src/components/customer/CustomerLayout.jsx`
- `src/components/customer/CustomerSidebar.jsx`
- `src/components/customer/CustomerTopbar.jsx`
- `src/components/customer/CustomerDemoNotice.jsx`
- `src/pages/customer/CustomerOverview.jsx`
- `src/pages/customer/CustomerSubscriptions.jsx`
- `src/pages/customer/CustomerSubscriptionDetail.jsx`
- `src/pages/customer/CustomerInvoices.jsx`
- `src/pages/customer/CustomerInvoiceDetail.jsx`
- `src/pages/customer/CustomerAccount.jsx`

### Files modified
- `src/App.jsx`
- `src/services/authService.js`
- `src/services/userProfileService.js` — fixed a pre-existing malformed `getVerifiedProfile` `try/catch` that prevented the build from parsing.
- `src/components/admin/DemoModeBadge.jsx` — generalized the tooltip so the same badge works for customer demo mode.
- `.env.example`
- `changes.md`

### Functional / UI changes
- Added the full customer portal under `/customer` using the existing light editorial design tokens and reused admin primitives (`AdminPageHeader`, `Panel`, `StatCard`, `StatusBadge`, `AdminDataTable`, `AdminInput`, `AdminSelect`, `AdminButton`, `AdminModal`, state components, sample-data labels).
- Completed Overview, My Subscriptions, subscription detail, My Invoices, invoice detail and My Account pages with responsive layouts.
- Overview shows active subscriptions, next renewal, outstanding amount, recent invoices, quick actions, loading/empty/error states and refresh.
- My Subscriptions lists subscription number, plan/product, term, renewal, price, billing frequency and status, with search and status filters. Detail pages show line items, quantities, taxes, totals, renewal/expiry dates and status history.
- Subscription actions (pause, renew, cancellation request) are enabled only when the plan policy permits. Disabled actions show the reason from the plan/demo policy.
- My Invoices lists invoice number, issue/due dates, total, customer status and separate workflow state, with search/filter and PDF actions. Invoice detail shows line items, totals and payment history. No Pay Now action was added; the UI states that payment collection remains with billing.
- My Account supports editable full name, email, business type, phone, company, profile save states, password validation/checklist, and logout. Email/password changes in production use Firebase reauthentication, `verifyBeforeUpdateEmail`/`updatePassword`; the email text field is never treated as a login identity change by itself.
- Added `CustomerPortalProvider` to normalize demo and real data access, derive overview values, and expose reload/action methods to pages.
- Real customer routes remain inside the existing customer-role `ProtectedRoute`. Admin routes, `/demo/admin`, Firebase auth, role verification and existing customer/staff route behavior were preserved.
- Added `src/services/customer/customerService.js` with isolated methods for overview, own subscriptions/detail/actions, own invoices/detail/PDF/payment history, and profile read/update. Requests send the Firebase ID token and use configurable `VITE_CUSTOMER_*` endpoints.

### Demo-only behavior
- Added `/demo/customer` and child routes only when `DEMO_MODE_ENABLED` (`import.meta.env.DEV`) is true. The routes render the customer layout without Firebase, profile verification or `ProtectedRoute`.
- Demo sidebar links stay under `/demo/customer`; the topbar shows the amber `DEMO MODE` badge and a sample-data badge. The sidebar shows a mock customer identity and exits to `/login` without calling Firebase sign-out.
- Demo data comes from `src/data/customer/customerDemoData.js` and is held in `CustomerPortalContext` local component state. Refreshing resets it; nothing is persisted and no Firestore/FastAPI calls are made.
- Demo pause/renew/cancellation actions mutate local sample state and explicitly state they are demo-session simulations. Profile edits and password changes are local simulations; passwords are never stored or logged.
- Demo PDF download generates a clearly labelled sample PDF in the browser and states that no server PDF was fetched.

### Tests / build
- `npm run build` — passed (Vite 8.3.5, 2125 modules transformed). Existing large-chunk advisory remains.
- `npm run lint` — completed with no errors. Remaining warnings are the existing unused `firebaseUser` parameter in `src/services/userProfileService.js`, existing admin demo context fast-refresh warnings, plus new fast-refresh and `set-state-in-effect` warnings in the customer context/account page.
- No development or preview server was started.

### Outstanding integration TODOs
- Set the agreed `VITE_CUSTOMER_OVERVIEW_ENDPOINT`, `VITE_CUSTOMER_SUBSCRIPTIONS_ENDPOINT`, `VITE_CUSTOMER_INVOICES_ENDPOINT` and `VITE_CUSTOMER_UPDATE_PROFILE_ENDPOINT` values with Thowfeek. Paths were intentionally not guessed.
- Replace real-route integration-pending errors with approved API contracts, then add server-driven pagination, retry and empty states where applicable.

## 2026-10-31 — Sales Rep and Finance Lead Portals (development only)

### Files modified
- `src/App.jsx`
- `src/lib/adminFormat.js`
- `src/lib/customerFormat.js`

### Functional / UI changes
- Added development-only `/demo/sales` and `/demo/finance` preview routes. They render the Sales Rep and Finance Lead portals immediately without Firebase login or Firestore user profiles.
- Both routes are gated by `import.meta.env.DEV` so they are removed from production bundles entirely.
- `/demo/sales` renders `SalesLayout demo` with sidebar navigation to Dashboard, Customers, Quotations, Subscriptions and Invoices.
- `/demo/finance` renders `FinanceLayout demo` with sidebar navigation to Dashboard, Invoices, Payments and Subscriptions.
- Sales Rep portal modules: Dashboard (stat cards), Customers (read-only list with search/filter), Quotations (create/view templates), Subscriptions (lifecycle management), Invoices (read-only billing view).
- Finance Lead portal modules: Finance Dashboard (revenue, outstanding, overdue, aging chart), Invoices (view all with lifecycle management), Payments (record payments, view history), Subscriptions (read-only details).
- All sidebar links work via `StaffSidebar.navTo()` which rewrites paths from `/sales/...` to `/demo/sales/...` and `/finance/...` to `/demo/finance/...` in demo mode.
- Demo data comes from the existing `StaffDemoDataContext` local fixtures; nothing is persisted and no Firebase records are created.
- Sales Rep role cannot access Staff Management, Product/Plan/Tax/Discount administration, Payment Management, or Finance Dashboard.
- Finance Lead role cannot access Staff Management, Product/Plan/Tax/Discount administration, Quotation editing, or Subscription creation/editing.
- Existing authentication routes (/login, /signup, /forgot-password) remain intact.
- Existing protected routes (/customer, /staff) continue to enforce Firebase role verification.

### Demo-only behavior
- Preview modes are gated by `import.meta.env.DEV`, which Vite compiles to `false` in production, so the demo routes and badge are removed from production bundles.
- Demo data comes from `StaffDemoDataContext` sample fixtures held in local component state. Refreshing resets it; nothing is persisted and no Firestore/FastAPI calls are made.
- Sales and Finance sidebar navigation works exclusively in development mode.

### Build
- `npm run build` — passed (Vite 8.3.5, 2146 modules transformed).
- `npm run lint` — passed with only pre-existing warnings.

### Outstanding integration TODOs
- Replace the demo data with FastAPI/Firestore adapters when backend is available.
- Confirm server-enforced role verification for real `/sales` and `/finance` routes.
