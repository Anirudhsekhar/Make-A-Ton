# Brightloop — Admin Five-Module Build Specification

## Objective
Implement all five admin frontend modules in the existing React + Vite + Tailwind project **in one pass**, prioritizing speed. Follow the current design reference (`design.md` and screenshot in `assets`) and reuse the existing Admin layout/sidebar. Do not redesign authentication, replace working routes, or modify Firebase/FastAPI services.

## Non-negotiable development constraints
- Preserve `/demo/admin` and provide working child navigation for every new module. Demo routes must be accessible without sign-in **only when `import.meta.env.DEV` is true**; no preview bypass in production.
- Use separate, realistic mock data and local component state while APIs are unavailable. Label demo UI clearly. Do not imply mock changes are persisted to Firebase or FastAPI. Provide clear integration TODOs and keep API-facing data handling isolated.
- All five pages must have responsive list/table views, Add/Edit forms, validation, useful empty states, and working demo interactions (create/edit, status toggle where applicable). Use stable IDs and sensible sample data. Avoid destructive changes to existing features.
- Append every implementation change to `changes.md` (create if absent); never overwrite earlier entries. Record files, behavior, build/test result, pending API integration.
- Work inside `brightloop-frontend` (where `package.json` lives). Run `npm run build`, fix errors, and **do not start a long-running dev/preview server**.

## 1. Staff Management
- Staff list: name, email, role, status, created date; search/filter.
- Add/Edit staff: full name, email, initial password (Add only), role fixed to `internal_staff`, status Active/Inactive. Admin may activate/deactivate.
- Validate email, required fields and password (>8 characters, uppercase, lowercase, special character). Never display or retain the password in mock lists or logs.
- Production TODO: admin-only backend operation to securely create Firebase Auth user + trusted staff profile; frontend must not directly grant staff roles or store plaintext passwords. Do not implement privileged creation in client-side Firebase SDK.

## 2. Products & Variants
- Product list and Add/Edit form: name, type (`Service`, `Software`, `Add-on`, `Other`), sales price, cost price, notes, status.
- Multiple variants per product: variant label/name, price adjustment (example: brand `Odoo` adds 560); add/remove variant rows. Show computed selling price in UI. Validate nonnegative base prices and numeric adjustments.
- Support edit and deactivate; show related plans. Every product should have an associated plan: indicate **Needs plan** until a plan is created, and offer navigation to Plans. Avoid silently inventing a plan.

## 3. Subscription Plans
- Plan list and Add/Edit form: plan name, linked existing product (required), price, billing period (`Daily`, `Weekly`, `Monthly`, `Yearly`), minimum quantity, available start/end dates.
- Toggles: auto-close at end, allow early close, allow pause, allow renew. Status Active/Inactive. Validate price >= 0, minimum quantity >= 1, end date >= start date.
- Admin can create, edit, deactivate and delete (demo deletion with confirmation; real deletion subject to backend referential-integrity rules). Show product relationship and billing period in list.

## 4. Taxes
- Tax rules list and Add/Edit form: tax name, percentage rate, description, Active/Inactive. Validate rate in 0–100.
- Support search, edit and status toggle. Show a small calculation preview (example subtotal × tax rate). Real invoice calculations remain backend responsibility.

## 5. Discounts
- Discount list and Add/Edit form: name/code, type (`Fixed amount` or `Percentage`), value, minimum purchase amount **or** minimum quantity, start date, end date, usage limit, applicability (`Selected products` or `Whole subscription`), selected products when relevant, Active/Inactive.
- Validate nonnegative fixed amount, percentage 0–100, positive usage limit if set, and valid date range. Support edit and deactivate. Show eligibility summary; actual enforcement, expiry, usage tracking and invoice application belong to backend.

## Navigation and UX
- Existing Admin sidebar links: Overview, Staff, Products, Plans, Taxes, Discounts. Keep current design tokens, typography and layout from assets reference.
- Ensure demo sidebar links resolve to `/demo/admin/...` and do not redirect to signup or verified-profile pending screens. Keep real protected admin routes intact and protected.
- Prefer reusable page header, data table, form/modal, badges and input components only where they speed up implementation. Accessible labels, keyboard-operable controls, loading/empty/error states, mobile-friendly layouts.

## Integration handoff
- Coordinate with Thowfeek (FastAPI endpoints, Firebase token verification, server-side role checks, CRUD, invoice rules) and Devananda (Firestore schema, user profiles and trusted roles). Do not invent production endpoint URLs or claim demo data is persisted.
- Keep a short TODO list in `changes.md` for service wiring, secure staff creation, persistence, product-plan referential integrity, and server-side tax/discount calculation.

## Completion checklist
- All five pages visible and navigable from `/demo/admin` in local development.
- Each module's demo list and form can be exercised without Firebase/backend.
- Existing Login/Signup/Forgot Password and production authorization unchanged.
- `npm run build` succeeds and `changes.md` has an appended entry.
