# Brightloop — Admin Frontend Specification

## Scope and workflow
Build the admin section incrementally in the existing React + Vite + Tailwind frontend. **First implement the shared admin layout and dashboard home only.** The remaining modules below are specifications for subsequent page-by-page tasks, not authorization to generate them all now. Inspect the existing project before modifying it. Preserve Login, Signup, Forgot Password, Firebase authentication, existing routing, and other working behavior.

Use the **current design reference in the frontend assets folder** (including any design.md and screenshot) as the visual source of truth. Do not revert to an older design. Keep responsive styling, accessible labels, loading/empty/error states, and reusable UI components. No unnecessary dependencies.

## Navigation and access
Admin sidebar: Overview, Staff, Products, Plans, Taxes, Discounts; include profile/logout. Routes should follow existing routing conventions. All admin routes must be guarded by the **verified admin role**, not a login dropdown, localStorage, or frontend-supplied role. Firebase Auth authenticates; the trusted role/profile source must be coordinated with the backend/database developers. Never grant admin access while role verification is unavailable. Do not hardcode credentials or pretend a UI check enforces backend authorization.

## 1. Admin overview — BUILD FIRST
Responsive sidebar/topbar and overview cards:
- Total customers
- Active subscriptions
- Monthly recurring revenue
- Outstanding payments
- Recent subscriptions list
- Revenue chart

Use a clearly marked isolated demo-data layer while APIs are unavailable; label figures as sample data, never real financial data. Provide sensible empty/loading/error states. Do not change auth services. Run `npm run build` from `brightloop-frontend` and fix errors; do not start a long-running preview server.

## 2. Staff management — NEXT PAGE
List/search staff with name, email, role (Internal Staff), status (Active/Inactive), and actions. Add Staff form: full name, email, role fixed to Internal Staff, admin-created password, status. Validate unique email through the eventual backend, password >8 characters with uppercase, lowercase, and special character, and required fields. Never store/display plaintext passwords after submission or persist them in demo data/logs. Staff creation must be a privileged server-side operation (e.g., Firebase Admin SDK via FastAPI), **not** public client-side Firebase `createUserWithEmailAndPassword` (which could replace the admin's session). Admin can activate/deactivate staff. Coordinate the actual endpoint and permission checks with Thowfeek and Devananda.

## 3. Products
Product list and add/edit form: name, type (Service, Software, Add-on, Other), sales price, cost price, notes, and multiple variants. Each variant has a label/category (e.g., Brand), value (e.g., Odoo), and price adjustment (e.g., +560). Validate required name/type and nonnegative base prices; show adjusted price clearly. Admin can manage product lifecycle. **Every product must have a plan**: provide an explicit link/create-plan workflow and indicate products missing a plan while in draft; enforce the agreed rule when publishing/activating, without inventing backend behavior.

## 4. Plans
List and add/edit form, linked to an existing product. Fields: plan name, price, billing period (Daily, Weekly, Monthly, Yearly), minimum quantity, availability start/end dates, and toggles for auto-close, early close, pause, renew. Admin can edit, deactivate, and delete plans (confirm destructive action; actual deletion rules to be agreed with backend). Validate nonnegative price, minimum quantity >=1, and end date >= start date. Show linked product and status.

## 5. Taxes
List and add/edit tax rules: name, percentage rate, description, Active/Inactive. Validate required name and sensible percentage range (0–100). Admin can manage tax rules. Final calculation/application belongs to backend, not frontend.

## 6. Discounts
List and add/edit form: name/code, type (fixed amount or percent), value, minimum purchase amount or minimum quantity, start/end dates, usage limit, scope (selected products or whole subscription), Active/Inactive. Validate required fields, nonnegative amounts, percent 0–100, quantity >=1 when specified, usage limit >=1 when specified, valid date order, and product selection for product scope. Admin alone creates discount rules; eligibility, usage enforcement, and invoice application are backend responsibilities.

## Data and integration boundaries
Backend is **not ready**: build frontend first. Isolate demo data and API adapters per feature so endpoints can be plugged in later. Clearly label any simulated create/update/delete as demo-only and do not imply Firebase persistence. Do not invent endpoint URLs, Firebase collections, tax logic, billing calculations, or server-enforced permissions. Agree on schemas, identifiers, currency, API contracts, and role verification with Thowfeek (FastAPI) and Devananda (Firebase) before real integration. Prefer reusable list, form, modal, confirmation, and status components when warranted.

## Build sequence
1. Inspect existing design/assets and auth/routing; build admin shell and Overview only.
2. Test responsiveness and `npm run build`.
3. Staff management.
4. Products and product-to-plan flow.
5. Plans.
6. Taxes.
7. Discounts.
8. Replace demo adapters with agreed real integrations and test role enforcement end-to-end.

## Mandatory change log
Create `changes.md` in the `brightloop-frontend` project root if absent. **Append** a dated entry after every future implementation task; never overwrite existing entries. Each entry records: task/page, files added/modified, functional/UI changes, tests/build result, demo-only behavior, and outstanding integration TODOs. Do not put secrets or passwords in the log.

## Definition of done for each task
Match current asset design; preserve all existing auth behavior; responsive desktop/mobile; clear validation and states; no console/build errors; `npm run build` succeeds; `changes.md` updated; concise completion summary. Do not implement subsequent pages unless explicitly asked.
