# ⚡ SyncBatch

**A minimal, high-performance SaaS platform to sync contacts from Excel to mobile devices.**

SyncBatch enables users to instantly upload contact lists (.xlsx, .csv) and sync them directly to their Google Contacts or download them as a `.vcf` file for iPhone. Designed with built-in organization modes and a robust credit-based payment model.

## 🌟 Features

*   **Excel/CSV Parsing**: Smart column detection with automatic phone number normalization.
*   **Direct Google Sync**: Leverages the Google People API to batch-insert contacts straight into your account.
*   **iPhone Support**: Dynamic generation of `.vcf` (vCard) files mapping directly to Apple's native importing.
*   **Smart Deduplication**: Checks existing Google Contacts to actively prevent duplicates before making API calls.
*   **Credit/Payment System**: Razorpay integration with 'Pay Per Sync' models spanning Personal and Institutional limits.
*   **Organization Mode**: Allows institutions to create teams, onboard members via secure invite links, and assign remote "sync requests".
*   **Built-in Security**: Hardened against XSS (React Server Rendering), CSRF (SameSite Lax HTTP-only cookies), and DoS (Upload limits & Security Headers).

## 🔒 Security Posture & Architecture

*   **Stateless JWT Sessions**: Authenticated state is securely kept in Edge-compatible encrypted JWT cookies (`jose`), preventing session hijacking and enforcing `HttpOnly` combined with `Secure` flags.
*   **Security Headers**: Integrated essential defenses against MIME sniffing and Clickjacking (HSTS, X-Frame-Options, X-Content-Type-Options) natively in the `next.config.mjs`.
*   **Data Leakage Prevention**: All MongoDB queries specifically filter out OAuth tokens when returning profile data to the client, preventing accidental exposure of sensitive Google access tokens.
*   **Upload Safety**: strict file-size limitations (Max 5MB) drop DoS vectors from massive memory-buffer parsing.
*   **Privacy-First Approach**: User contacts are only maintained transiently during processing. They are not indexed or retained functionally against active databases for marketing purposes.

## 🚀 Quick Setup Guide

### 1. Requirements

*   Node.js 18+
*   MongoDB Instance (Local or Atlas)
*   Google Cloud Console Account (OAuth Client ID)
*   Razorpay Dashboard

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/syncbatch

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Session Auth (run: openssl rand -base64 32)
SESSION_SECRET=your_32_byte_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payments
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_id
```

### 3. Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to `http://localhost:3000`.

## 🛠️ Technology Stack

*   **Frontend**: React, Next.js (App Router), Tailwind CSS v4, Lucide Icons
*   **Backend**: Next.js API Routes, Mongoose, Node.js
*   **Authentication**: Google OAuth 2.0, `jose` JWTs
*   **Payments**: Razorpay
*   **Utilities**: `xlsx` (parsing), `react-hot-toast` (alerts), `react-dropzone` (uploads)

---
*A product by INOVUS LABS IEDC*
