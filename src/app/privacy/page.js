'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
                <p className="text-sm text-slate-500">Last updated: March 27, 2026</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary-500" />
                  1. Information We Collect
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  At SyncBatch, your privacy is our core priority. We only collect information strictly necessary to provide our contact syncing services:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600 text-sm">
                  <li><strong>Account Information</strong>: Your name, email address, and profile picture provided by Google OAuth.</li>
                  <li><strong>Google OAuth Tokens</strong>: Short-lived access tokens to interact with the Google People API on your behalf. We <strong>do not</strong> store your Google password.</li>
                  <li><strong>Transient Contact Data</strong>: Contacts uploaded via Excel/CSV are processed in-memory. We do not permanently store your contact lists in our database.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-500" />
                  2. How We Use Your Data
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  We use your information exclusively to provide and improve our services. <strong>We do not sell, trade, or rent your personal information or contact data to third parties.</strong> We use your data to:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600 text-sm">
                  <li>Facilitate the synchronization of contacts between your provided files and your Google account via the Google People API.</li>
                  <li>Process payments and manage your credit balance via Razorpay.</li>
                  <li>Provide administrative access and organization management features if you are on an Institutional Plan.</li>
                  <li>Improve our internal parsing logic to better detect contact fields.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  3. Data Security
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  We implement industry-standard security measures, including:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600 text-sm">
                  <li><strong>Encrypted Sessions</strong>: Using stateless JWTs stored in secure, HttpOnly cookies.</li>
                  <li><strong>Hardened Infrastructure</strong>: Protection against XSS, CSRF, and DoS attacks.</li>
                  <li><strong>No Permanent Storage</strong>: Uploaded contact data is transient and filtered out of our system after the sync session.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  4. Third-Party Services
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  We integrate with the following trusted providers:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600 text-sm">
                  <li><strong>Google</strong>: For authentication and People API contact sync.</li>
                  <li><strong>Razorpay</strong>: For secure payment processing. We do not store your credit card details.</li>
                  <li><strong>Vercel</strong>: For hosting and high-performance serverless execution.</li>
                </ul>
              </section>

              <section className="bg-primary-50/50 p-6 rounded-2xl border border-primary-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 text-primary-700">
                  <Shield className="w-5 h-5" />
                  5. Google API Disclosure
                </h2>
                <p className="text-slate-700 leading-relaxed text-sm italic">
                  SyncBatch&apos;s use and transfer of information received from Google APIs to any other app will adhere to the 
                  <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" className="text-primary-600 underline ml-1">
                    Google API Service User Data Policy
                  </a>, including the Limited Use requirements.
                </p>
                <p className="text-slate-600 leading-relaxed text-sm mt-4">
                  We specifically use the <code>https://www.googleapis.com/auth/contacts</code> scope to create, update, and delete contacts <strong>only</strong> when you explicitly request a sync or bulk delete action. This data is never stored permanently on our servers and is used solely to facilitate the transfer from your files to your Google account.
                </p>
              </section>

              <div className="pt-10 border-t border-slate-100 mt-10">
                <p className="text-sm text-slate-500">
                  By using SyncBatch, you agree to the collection and use of information in accordance with this policy. If you have questions, reach us at <span className="font-semibold text-primary-600">inovuslabs@kjcmt.ac.in</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
