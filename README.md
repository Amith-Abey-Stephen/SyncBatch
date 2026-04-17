# ⚡ SyncBatch

**A minimal, high-performance SaaS platform to sync contacts from Excel to mobile devices (iOS & Android).**

SyncBatch enables users to instantly upload contact lists (.xlsx, .csv) and sync them directly to their Google Contacts or download them as a `.vcf` file for iPhone. Designed with built-in organization modes, a robust credit-based payment model, and an advanced admin control center.

---

## 🌟 Core Features

*   **Excel/CSV Parsing**: Smart column detection with automatic phone number normalization.
*   **Direct Google Sync**: Leverages the Google People API to batch-insert contacts straight into your account.
*   **Bulk Management**: Advanced "Bulk Delete" mode to remove uploaded contact batches from your Google account in seconds.
*   **iPhone Support**: Dynamic generation of `.vcf` (vCard) files mapping directly to Apple's native importing.
*   **Smart Deduplication**: Checks existing Google Contacts to actively prevent duplicates before making API calls.
*   **Credit/Payment System**: Razorpay integration with 'Pay Per Sync' models spanning Personal and Institutional limits.
*   **Organization Mode**: Allows institutions to create teams, onboard members via secure invite links, and assign remote "sync requests".
*   **Admin Dashboard**: High-density statistics tracking revenue, user registrations, and platform health.
*   **Subscription Gating**: Intelligent UI guards that restrict advanced organization features to Institutional and Admin tiers.
*   **Legal Compliance**: Built-in [Privacy Policy](file:///d:/Drive%20D/phone/syncbatch/src/app/privacy/page.js) and [Terms of Service](file:///d:/Drive%20D/phone/syncbatch/src/app/terms/page.js) pages for platform transparency.
*   **Security First**: Hardened against XSS, CSRF, and DoS (Upload limits & Security Headers).

---

## 🔄 Detailed User Flows

### 1. Personal Flow (For Individuals)
*   **Step 1: Onboarding**: Sign in instantly using Google OAuth 2.0.
*   **Step 2: Method**: Choose between **Add Mode** (Bulk Sync) or **Delete Mode** (Bulk Remove).
*   **Step 3: Upload**: Drag & Drop your Excel/CSV file (Max 5MB).
*   **Step 4: Preview**: View exactly which contacts were found, remove any entries, and check for normalization warnings.
*   **Step 5: Execution**:
    *   **Google Sync/Delete**: Automatically pushes or removes contacts from your Google account.
    *   **iPhone VCF**: (Add mode only) Download a generated vCard file for manual import on iOS devices.
*   **Step 6: Results**: Get a report of successfully processed contacts.

### 2. Institutional Flow (For Organizations)
*   **Step 1: Formation**: Create an Organization (Requires Institution Pack).
*   **Step 2: Team Building**: Generate unique invite links and send them to members.
*   **Step 3: Request Creation**: Upload a contact list and create a "Sync Request" targeting specific members.
*   **Step 4: Member Action**: Members receive a notification on their dashboard and can "Accept" the request to instantly sync those contacts to their phone without having the original file.
*   **Step 5: Monitoring**: Org owners can track which members have completed the sync.

---

## 💳 Subscriptions & Limits

SyncBatch uses a credit-based system. **1 Sync = 1 Credit**.

### Personal Packs (Single-User Focus)
- **Intro Pack (₹29)**: 3 syncs, 100 contacts/sync limit.
- **Power Pack (₹79)**: 10 syncs, 500 contacts/sync limit.
- **Pro Pack (₹149)**: 25 syncs, 1,000 contacts/sync limit.

### Institution Packs (Multi-User Collaboration)
- **Dept Starter (₹499)**: 50 requests, 2,000 contacts/sync limit.
- **Campus Elite (₹1,499)**: 200 requests, 10,000 contacts/sync limit, Admin control panel access.

---

## 🔒 Security Posture

*   **Stateless JWT Sessions**: Authenticated state is securely kept in Edge-compatible encrypted JWT cookies (`jose`), preventing session hijacking and enforcing `HttpOnly` combined with `Secure` flags.
*   **Security Headers**: Integrated essential defenses against MIME sniffing and Clickjacking (HSTS, X-Frame-Options, X-Content-Type-Options) natively in the `next.config.mjs`.
*   **Token Protection**: All MongoDB queries specifically filter out OAuth tokens when returning profile data to the client, preventing accidental exposure of sensitive Google access tokens.
*   **Privacy-First**: No contact data is stored permanently. Contacts from uploads are only used for processing and are filtered out of the database after the sync session.

---

## 🚀 Setup & Installation

### 1. Requirements
*   Node.js 18+
*   MongoDB Instance
*   Google Cloud Console Account (Enable People API)
*   Razorpay API Keys

### 2. Environment Variables (.env.local)
```env
MONGODB_URI=mongodb://your_uri
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
SESSION_SECRET=your_random_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_id
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_id
```

### 3. Run Locally
```bash
npm install
npm run dev
```

---
*A product by INOVUS LABS IEDC*
