# SyncBatch - Detailed Project Analysis & Documentation

## 1. Project Overview
**SyncBatch** is a production-ready, full-stack web application designed to simplify the management and synchronization of bulk contact lists. It allows users to upload spreadsheets containing hundreds of contacts and instantly sync them to their mobile devices via Google Contacts or standardized VCF imports.

### Core Value Proposition
The project solves the "manual entry" problem for sales teams, event organizers, and businesses that need to move contact data from Excel/CSV files directly into their pocket devices.

---

## 2. Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | High-performance React framework with server-side rendering. |
| **Frontend** | React 19 / Tailwind CSS 4 | Modern, utility-first styling with sleek dark-mode aesthetics. |
| **Database** | MongoDB + Mongoose | NoSQL database for flexible user and contact data storage. |
| **Authentication** | Google OAuth 2.0 + JWT | Secure login and direct integration with Google People API. |
| **Storage/Sync** | Google People API | Primary API for real-time contact synchronization. |
| **Payments** | Razorpay | Integrated payment gateway for credit-based monetization. |
| **File Processing** | XLSX.js | Robust parsing for `.xlsx`, `.xls`, and `.csv` files. |
| **Utilities** | Lucide React / Jose | Icon sets and lightweight JWT handling. |

---

## 3. Database Schema (Mongoose Models)

### `User` Table
Stores user profile, subscription status, and Google OAuth tokens.
*   **Fields**: `name`, `email`, `role`, `credits` (Number), `plan` (free/paid), `syncPreference`, `googleAccessToken`, `googleRefreshToken`.

### `Organization` Table
Enables group-based contact sharing and team management.
*   **Fields**: `name`, `ownerId` (Ref: User), `members` (Array of Ref: User), `inviteToken`.

### `ContactList` Table
The central repository for uploaded contact batches.
*   **Fields**: `title`, `orgId`, `contacts` (Array: {name, phone}), `createdBy` (Ref: User).

### `SyncRequest` Table
Tracks individual synchronization actions across different users.
*   **Fields**: `listId`, `requestedBy`, `targetUsers` (Array: {userId, status, syncedAt}).

### `Transaction` Table
Audit log for all credit purchases and plan upgrades.
*   **Fields**: `userId`, `amount`, `creditsAdded`, `paymentId`, `orderId`, `status`.

---

## 4. Key Features & Modules

### A. Bulk Sync Engine
*   **File Upload**: Supports drag-and-drop Excel/CSV uploads.
*   **Intelligent Parsing**: Automatically detects "Name" and "Phone" columns using fuzzy matching.
*   **Duplicate Detection**: Checks existing Google contacts before adding to avoid clutter.
*   **VCF Generation**: Dynamic creation of `.vcf` files for native iPhone imports.

### B. Bulk Management (New Feature)
*   **Bulk Delete**: A powerful tool to remove uploaded batches from Google Contacts in one click, including a safety confirmation modal.

### C. Organization & Sharing
*   **Team Directories**: Organizations can host shared contact lists.
*   **Invite System**: Token-based invitations for team members to join organizations and access shared lists.

### D. Monetization System
*   **Credit-based Syncing**: Users use credits for large sync operations.
*   **Plan Tiers**: Differentiates between Free and Paid users with varying limits (e.g., 50 contacts per sync).

---

## 5. Directory Structure
```
syncbatch/
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   │   ├── api/            # Backend endpoints (auth, sync, upload)
│   │   ├── dashboard/      # Primary User Interface
│   │   └── credits/        # Billing & Payments
│   ├── components/         # UI Elements (Navbar, Footer, Skeletons)
│   ├── context/            # AuthContext (State Management)
│   ├── lib/
│   │   ├── models/         # Database Schemas
│   │   ├── google.js       # Google API Helpers
│   │   ├── session.js      # JWT Session Logic
│   │   └── contacts.js     # Spreadsheet Parsing Utility
├── public/                 # Static Assets
└── package.json            # Dependency Manifest
```

---

## 6. Use Cases
1.  **Direct Sales**: Sales representatives uploading lead lists to call immediately.
2.  **Corporate Directories**: HR departments sharing employee contacts with the whole team.
3.  **Political/NGO Campaigns**: Coordinators managing volunteer lists across multiple regions.
4.  **Batch Cleanup**: Using the "Bulk Delete" feature to remove outdated marketing contacts from professional accounts.

---

## 7. Configuration Requirements
To run this project, the following environment variables are required:
*   `MONGODB_URI`: Connection string for the database.
*   `GOOGLE_CLIENT_ID / SECRET`: OAuth credentials from Google Cloud Console.
*   `SESSION_SECRET`: Security key for JWT encryption.
*   `RAZORPAY_KEY_ID / SECRET`: Payment gateway credentials.
*   `NEXT_PUBLIC_APP_URL`: The production or development URL of the app.
