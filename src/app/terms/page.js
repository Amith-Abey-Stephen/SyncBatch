'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Smartphone, CreditCard, Building2, ShieldCheck, Zap } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-8 text-slate-800">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight tracking-tight">Terms of Service</h1>
                <p className="text-sm text-slate-500">Last updated: March 27, 2026</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none space-y-8 text-sm">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary-500" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  By accessing or using SyncBatch, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary-500" />
                  2. Description of Service
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  SyncBatch provides a platform to synchronize contact lists from Excel/CSV files to Google Contacts or download them in vCard (VCF) format for mobile devices.
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600">
                  <li><strong>Personal Flow</strong>: Direct device sync for individuals.</li>
                  <li><strong>Institutional Flow</strong>: Member-wide synchronization through organization-based sync requests.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  3. Subscriptions & Payments
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  SyncBatch operates on a credit-based subscription model.
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600">
                  <li><strong>Credits</strong>: 1 Sync operation = 1 credit. Credits are non-refundable except where required by law.</li>
                  <li><strong>Payments</strong>: All payments are processed via Razorpay. We do not store financial information.</li>
                  <li><strong>Plan Limits</strong>: Each pack (Personal or Institution) has a maximum contact sync limit (e.g., 50 for free users, up to 10,000 for elite users). Users must choose the correct pack for their needs.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-500" />
                  4. Organization & Member Use
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Owners of organizations are responsible for invitations sent to members. Sync Requests are initiated by the owner and must be explicitly accepted by the member for the sync to occur.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary-500" />
                  5. Google Account & API Usage
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Users grant SyncBatch permission to access the Google People API to facilitate contact creation. Users are responsible for maintaining the security of their own Google accounts.
                </p>
              </section>

              <div className="pt-10 border-t border-slate-100 mt-10">
                <p className="text-sm text-slate-500">
                  If you have questions about these Terms, reach us at <span className="font-semibold text-primary-600">inovuslabs@kjcmt.ac.in</span> or via INOVUS LABS IEDC.
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
