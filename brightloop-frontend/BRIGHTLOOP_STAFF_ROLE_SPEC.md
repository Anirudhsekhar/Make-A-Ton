# Brightloop — Staff Portals and Four-Role Access Specification

## Goal
Implement separate Sales Rep and Finance Lead portals, update login role selection and Admin Add Staff form, while preserving existing Admin, Customer, Firebase, and local demo functionality. Use the existing design references in `assets/`. Frontend uses React + Vite + Tailwind. Backend is FastAPI + Firebase Admin/Firestore.

## Canonical roles
Store a single trusted user field `role` with exactly: `admin | sales_rep | finance_lead | customer`. Retire `internal_staff` from new UI and contracts; coordinate migration of existing profiles with Devananda/Thowfeek before switching real authorization. Public signup always creates `customer`. Only Admin can create staff, selecting Sales Rep or Finance Lead and setting an initial password. Never let users select/assign a privileged role during signup. Never infer authorization from login dropdown, URL, localStorage, or client-side demo data.

## Login changes
Role dropdown: Admin, Sales Rep, Finance Lead, Customer. Authenticate through existing Firebase flow, then obtain verified role from FastAPI/profile service. A mismatch shows an error; a match routes to `/admin/dashboard`, `/sales/dashboard`, `/finance/dashboard`, or `/customer/dashboard`. Google login follows the same verification. Preserve Forgot Password and Signup. Profile verification pending must not grant real access.

## Permissions matrix
| Feature | Admin | Sales Rep | Finance Lead | Customer |
|---|---|---|---|---|
| Create staff, choose type, manage staff | Full | No | No | No |
| Products/variants, plans, taxes, discount rules | Full | No | No | No |
| Customers | Full | View list/detail only; no add/edit/delete | No access by default | Own profile only |
| Quotation templates | Full | List/create/edit; select existing plan/product lines, validity days | No | No |
| Subscriptions | Full | List/create/edit, template creation, lifecycle actions | View list/detail only | Own only, permitted customer actions |
| Invoices | Full | View list/detail only | List/detail; generate from subscriptions, confirm/cancel/send/print | Own only, PDF download |
| Payments | Full | No | Record/list/view linked to invoices | Own payment history if provided |
| Finance dashboard | Full | No | Full | No |

All API permissions must be enforced in FastAPI middleware/dependencies using verified Firebase token and trusted stored role; forbidden operations return HTTP 403. Frontend guards and sidebar visibility are UX only.

## Sales Rep portal
Route `/sales/dashboard` with sidebar only: Overview, Customers, Quotation Templates, Subscriptions, Invoices (read-only), Profile/Logout.
- Customers: searchable list and detail, view-only. No Add/Edit/Delete controls.
- Quotation templates: list and create/edit form: template name, existing plan, product lines (product, quantity, unit price, tax, amount), validity in days. Create subscription from template.
- Subscriptions list: number, customer, plan, status, filters. Detail/form: customer, plan, start/expiry, payment terms, lines (product, qty, unit price, tax, amount), template button, stepper Draft → Quotation → Confirmed → Active → Closed. Implement permitted lifecycle actions; obey plan pause/renew/early-close flags.
- Invoices: read-only list/detail/status, no finance actions or payment access.

## Finance Lead portal
Route `/finance/dashboard` with sidebar only: Overview, Subscriptions (read-only), Invoices, Payments, Finance Dashboard, Profile/Logout.
- Subscriptions: searchable/filterable list/detail; no create/edit/status controls.
- Invoices: list with Draft/Confirmed/Paid and overdue filters; detail with customer, lines, taxes, discount, totals, payments; generate from subscription, Confirm/Cancel/Send/Print. Show meaningful disabled states for invalid actions. Avoid duplicate billing.
- Payments: list and record form (invoice, method, amount, date, note), invoice linkage and payment history. Mock invoice marked Paid when fully settled.
- Finance dashboard: active subscription count, revenue received, outstanding amount, overdue invoices table, date filters and summary chart/cards.

## Admin changes
Admin Add Staff form: full name, email, initial password, staff type (`sales_rep` or `finance_lead`), active/inactive. No generic `internal_staff` option. Password validation consistent with signup (>8 chars, upper/lower/special). Never expose stored passwords. Real creation must use a secure admin-only backend endpoint, not Firebase client `createUserWithEmailAndPassword` (which would switch the admin's session). Admin retains full access to operational modules.

## Demo and implementation
- Development-only `/demo/sales` and `/demo/finance` routes, independent of Firebase/profile checks, with mock data and DEMO MODE badge. Use `import.meta.env.DEV` as the hard guard. Ensure demo sidebar links remain in their own demo route namespace. Existing `/demo/admin` and `/demo/customer` must keep working.
- Use isolated mock repositories/services and realistic linked fixtures (customers → subscriptions → invoices → payments); local state CRUD is sufficient for preview. Never claim demo changes persist to Firestore or invoke live writes.
- Reuse existing layout/components and styling from `assets/`; no redesign or unnecessary dependencies. Prefer shared operational components with role-based action props over duplicate pages.
- Keep real API integrations as TODO/service boundaries until Thowfeek provides exact endpoint contracts. Do not invent endpoints or collection names. Add loading/empty/error states, form validation, responsive UI.
- Append each change, touched files, build result, and pending integration work to `changes.md`; never overwrite prior history.
- Run `npm run build` from frontend root; fix errors; do not launch a persistent preview server.

## Acceptance checks
1. Login shows four role labels; public signup is customer-only.
2. Admin Add Staff supports Sales Rep / Finance Lead and initial password.
3. `/demo/sales` works without Firebase and has no customer-edit, invoice-edit, payment or finance controls.
4. `/demo/finance` works without Firebase and has no subscription-edit, quotation, product, tax, discount or staff controls.
5. Admin and Customer demos and existing authentication still work.
6. Production routes reject unauthenticated/unverified users; real API must return 403 on forbidden operations.
7. Build passes and `changes.md` is appended.

## Coordination needed
Devananda: migrate/seed verified roles and admin-created staff accounts. Thowfeek: enforce matrix server-side and share endpoints/contracts; use Firebase Admin SDK for staff account creation without changing the admin session.
