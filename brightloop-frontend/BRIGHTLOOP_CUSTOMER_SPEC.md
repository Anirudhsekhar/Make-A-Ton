# Brightloop — Customer Portal Specification

## Scope
Build the Customer Portal frontend in the existing React + Vite + Tailwind project. Reuse the current design reference in `assets`, existing components and navigation patterns. Do not change the Admin pages, Firebase authentication, production authorization or backend services.

## Pages

### Customer overview
- Cards: active subscriptions, next renewal date, outstanding amount, recent invoices.
- Quick actions link to My Subscriptions, My Invoices and My Account.
- Responsive layout, loading/empty/error states.

### My Subscriptions
- Show only subscriptions belonging to the authenticated customer in production; enforce ownership server-side, not by frontend filtering alone.
- List with subscription number, plan/product, dates, price, billing frequency and status (e.g. Draft, Quotation, Confirmed, Active, Closed as applicable).
- Detail view with line items, quantities, taxes, totals, renewal and expiry dates.
- Allow pause, renew and cancellation request only when the plan permits; show disabled controls with explanations otherwise. In demo, simulate actions locally and label them as demo-only.

### My Invoices
- Customer-owned invoice list with invoice number, date, due date, total and Paid / Outstanding / Overdue status. Invoice workflow states (Draft / Confirmed / Paid) may be shown separately.
- Invoice details and payment history.
- PDF download action: integrate with the eventual authenticated backend PDF endpoint; in demo use an explicitly labelled sample PDF or disable download with a clear explanation. Never imply a real invoice PDF was fetched when it was not.
- No Pay Now requirement at this stage.

### My Account / Profile
- Full name, email, business type, phone number, company name, change password and logout.
- All fields requested as editable, but changing email and password must use Firebase secure reauthentication/verification workflows; do not treat editing an email text field as changing the Firebase login identity.
- Validate input, display save/loading/error/success states. Do not store passwords in Firestore or mock profile data.

## Customer Demo Mode
- Add `/demo/customer` and child routes, usable only when `import.meta.env.DEV` is true.
- Render customer layout and mock data directly, without Firebase, profile verification, protected route wrappers or redirect to Signup.
- Keep demo sidebar links within `/demo/customer`; show visible `DEMO MODE` badge.
- Demo CRUD/actions are local simulation only and must not call real APIs or mutate Firestore.
- Never ship an authentication bypass in production. Preserve `/demo/admin` and all existing real routes.

## Integration boundaries
- Prepare isolated customer API service methods and TODOs for Thowfeek's FastAPI contracts: overview, own subscriptions/detail/actions, own invoices/detail/PDF/payment history, profile read/update.
- Firebase authentication and sensitive credential changes follow the existing auth architecture; coordinate contracts with Devananda.
- API must verify Firebase ID tokens, roles and customer ownership for every resource. Do not invent final endpoint paths or Firestore collection names.

## Acceptance checks
- Overview, subscriptions, invoices and profile navigate correctly from `/demo/customer`.
- Lists, detail views, mock interactions, form validation and responsive layouts work.
- Admin demo, production auth and existing functionality remain unchanged.
- `npm run build` passes. Do not launch a long-running preview server.
- Append modified files, implementation notes, test results and pending integrations to `changes.md`; never overwrite prior entries.
