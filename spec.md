# Smart Campus Print

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack mobile-first campus printing web app
- User auth: student/staff signup with name, email, phone, student ID, department; login/logout; role-based access (student, admin)
- Home dashboard: list campus printers with status (Working/Offline/Out of Paper) and location tags
- Document upload: PDF/DOCX/image files via blob-storage, file rename, temporary storage
- Print configuration: printer selection, copies, color/B&W, single/double side, page size (A4/A3), page range, orientation, total pages, instant price calculation
- Pricing engine: configurable rates per page by color mode, paper size, side; admin-editable pricing rules
- Payment: mock UPI-style payment flow; invoice/receipt generation; job locked until payment succeeds
- Secure print release: system generates 6-digit release code post-payment; code entry at printer triggers print start
- Job tracking: statuses — Uploaded, Pending Payment, Paid, Ready to Print, Printing, Completed, Failed; print history; reprint option
- In-app notifications: payment success, printing started, printing completed, failure alerts
- Admin panel: manage printers (add/edit/status update), manage pricing rules, view all jobs, handle refund requests, analytics (total prints, revenue, most used printer)
- Auto-delete documents after print completion for privacy

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select components: authorization (role-based: student, admin), blob-storage (document uploads)
2. Generate Motoko backend with entities: User, Printer, PrintJob, Payment, PricingRule, Notification
3. Backend APIs: auth/registration, printer CRUD, job lifecycle (upload → configure → pay → release → complete), pricing calculation, release code verification, admin analytics
4. Frontend pages: Landing, Login/Signup, Student Dashboard, Upload Document, Print Settings, Payment, Release Code, Job History, Admin Dashboard, Printer Management, Analytics
5. Mobile-first responsive design with clean card-based UI
