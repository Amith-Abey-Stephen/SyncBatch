# ⚡ SyncBatch

**A premium, high-performance SaaS platform to sync contacts from Excel to mobile devices (iOS & Android).**

SyncBatch enables users to instantly upload contact lists (.xlsx, .csv) and sync them directly to their Google Contacts or download them as a `.vcf` file for iPhone. Designed with built-in multi-organization support, a robust credit-based payment model, and an advanced admin control center.

---

## 🌟 Core Features

*   **Excel/CSV Parsing**: Smart column detection with automatic phone number normalization.
*   **Direct Google Sync**: Leverages the Google People API to batch-insert contacts straight into your account.
*   **Bulk Management**: Advanced "Bulk Delete" mode to remove uploaded contact batches from your Google account in seconds.
*   **iPhone Support**: Dynamic generation of `.vcf` (vCard) files mapping directly to Apple's native importing.
*   **Multi-Organization Hubs**: Create multiple synchronization hubs for different departments or teams with strict **Data Isolation**.
*   **Team Control Center**: Advanced management for owners, including **Ownership Transfer**, **Member Removal**, and **Organization Deletion**.
*   **Real-Time Sync Feedback**: Members receive live progress updates during broadcasts with a dedicated "Secure Sync" UI.
*   **Credit/Payment System**: Razorpay integration with 'Pay Per Sync' models spanning Personal and Institutional limits.
*   **Smart Deduplication**: Checks existing Google Contacts to actively prevent duplicates before making API calls.
*   **Admin Dashboard**: High-density statistics tracking revenue, user registrations, and platform health.
*   **Aesthetic UX**: A modern, vibrant #2563EB Blue interface with glassmorphism effects and micro-animations.

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
*   **Step 1: Formation**: Create one or more Organizations (Requires Institution Pack).
*   **Step 2: Team Building**: Generate unique invite links and onboard members.
*   **Step 3: Request Creation**: Upload a contact list and create a "Sync Request" (Add or Delete) targeting specific members.
*   **Step 4: Member Action**: Members receive a real-time notification. They can **Preview Contacts** and click **Sync Now** to start a secure, animated synchronization process.
*   **Step 5: Monitoring**: Org owners can track which members have completed the sync and manage team access in real-time.

---

## 💳 Subscriptions & Limits

SyncBatch uses a credit-based system. **1 Sync = 1 Credit**.

### Personal Packs (Single-User Focus)
- **Intro Pack (₹29)**: 3 syncs, 100 contacts/sync limit.
- **Power Pack (₹79)**: 10 syncs, 500 contacts/sync limit.
- **Pro Pack (₹149)**: 25 syncs, 1,000 contacts/sync limit.

### Institution Packs (Multi-User Collaboration)
- **Dept Starter (₹499)**: 50 requests, 2,000 contacts/sync limit, 1 Organization Hub.
- **Campus Elite (₹1,499)**: 200 requests, 10,000 contacts/sync limit, 3 Organization Hubs, Admin control panel access.

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
*   Resend API Key (for Contact Form)

### 2. Environment Variables (.env.local)
```env
MONGODB_URI=mongodb://your_uri
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
SESSION_SECRET=your_random_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_id
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_SESSION_TIMEOUT=1800
RESEND_API_KEY=your_resend_api_key
```

### 3. Run Locally
```bash
npm install
npm run dev
```

---
*A product by INOVUS LABS IEDC*
