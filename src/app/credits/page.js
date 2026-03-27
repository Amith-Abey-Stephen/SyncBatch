'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { CreditCard, Check, Zap, Users, Shield, Star, ArrowRight, Building2, Smartphone, HelpCircle } from 'lucide-react';
import { PLANS } from '@/lib/plans';

export default function CreditsPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [purchasing, setPurchasing] = useState(null);
  const [tab, setTab] = useState('personal');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (planId) => {
    setPurchasing(planId);
    try {
      const orderRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create order');
        return;
      }
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        return;
      }
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SyncBatch',
        description: `Credit Pack - ${planId}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success(`${verifyData.creditsAdded} credits added! Total: ${verifyData.credits}`);
              refreshUser();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (e) {
            toast.error('Verification error');
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => { toast('Payment cancelled', { icon: '✕' }); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading || !user) return null;

  const currentPlans = tab === 'personal' ? PLANS.personal : PLANS.institution;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen hero-pattern">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section 1: Guide (Top) */}
          <div className="mb-12 bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50 fade-in-up">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                   <HelpCircle className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Which plan is right for you?</h2>
             </div>
             <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                   <h4 className="flex items-center gap-2 font-bold text-primary-600 text-xs uppercase tracking-widest"><Zap className="w-3.5 h-3.5" /> Personal Packs</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">Best for students or individuals who need to sync contact lists to their own phone. Quick, simple, and direct device connection.</p>
                </div>
                <div className="space-y-3">
                   <h4 className="flex items-center gap-2 font-bold text-purple-600 text-xs uppercase tracking-widest"><Users className="w-3.5 h-3.5" /> Institution Packs</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">Best for teachers or coordinators. Push contacts to 50+ members at once via <strong>Sync Requests</strong>—no student needs the original file!</p>
                </div>
             </div>
          </div>

          <div className="text-center mb-8 fade-in-up-delayed">
             <h1 className="text-2xl font-black text-slate-900 mb-2">Select Your Sync Model</h1>
             <p className="text-sm text-slate-500">Pick a flow that fits your workflow</p>
          </div>

          {/* Section 2: Model Toggle */}
          <div className="grid md:grid-cols-2 gap-6 mb-12 fade-in-up-delayed-2">
             <div 
               onClick={() => setTab('personal')}
               className={`cursor-pointer rounded-3xl p-6 border-2 transition-all flex items-start gap-4 ${tab === 'personal' ? 'border-primary-500 bg-white shadow-xl shadow-primary-500/10' : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100 hover:scale-[1.01]'}`}
             >
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
                   <Smartphone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900">Personal Sync</h3>
                   <p className="text-xs text-slate-500 mt-1">Direct device sync for personal use.</p>
                </div>
             </div>
             <div 
               onClick={() => setTab('institution')}
               className={`cursor-pointer rounded-3xl p-6 border-2 transition-all flex items-start gap-4 ${tab === 'institution' ? 'border-primary-500 bg-white shadow-xl shadow-primary-500/10' : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100 hover:scale-[1.01]'}`}
             >
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0">
                   <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900">Institution Sync</h3>
                   <p className="text-xs text-slate-500 mt-1">Organization & Team-wide sync requests.</p>
                </div>
             </div>
          </div>

          <div className="border-t border-slate-100 pt-10 text-center mb-10 fade-in-up-delayed-2">
            <h2 className="text-3xl font-black font-heading text-slate-900 mb-2 uppercase tracking-tighter italic">
              {tab === 'personal' ? 'Personal' : 'Instructional'} Pricing
            </h2>
          </div>

          {/* Section 3: Pricing Cards */}
          <div className={`grid gap-6 fade-in-up-delayed-3 ${currentPlans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-3xl mx-auto'}`}>
            {currentPlans.map((plan) => (
              <div key={plan.id} className={`relative bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform`}>
                <div className="text-center">
                  <p className="text-xs font-bold text-primary-600 bg-primary-50 inline-block px-3 py-1 rounded-full mb-4 tracking-widest">{plan.name}</p>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900">₹{plan.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 font-medium">Synced Credits: {plan.credits}</p>

                  <ul className="space-y-3 text-left mb-8 border-t border-slate-50 pt-6">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasing === plan.id}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {purchasing === plan.id ? <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <><CreditCard className="w-4 h-4" /> Buy Now</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
