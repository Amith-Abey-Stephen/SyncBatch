'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { CreditCard, Check, Zap, Users, Shield, Star, ArrowRight, Building2, Smartphone, HelpCircle, RefreshCw } from 'lucide-react';
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
    
    // Support direct tab linking (e.g. /credits?tab=org)
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    if (urlTab === 'org') {
      setTab('org');
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
              await refreshUser();
              router.push('/dashboard');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (e) {
            toast.error('Verification error');
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#7c3aed' },
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
                    <h4 className="flex items-center gap-2 font-bold text-primary-600 text-xs uppercase tracking-widest"><Zap className="w-3.5 h-3.5" /> Personal Sync</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Best for individual contact lists. Directly sync Excel data to your Google or iCloud account in seconds.</p>
                 </div>
                 <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-bold text-purple-600 text-xs uppercase tracking-widest"><Building2 className="w-3.5 h-3.5" /> Institutional Hub</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Best for organizations. Create <strong>multiple organization hubs</strong> (up to unlimited) and broadcast contacts to thousands of members simultaneously.</p>
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
               {tab === 'personal' ? 'Personal' : 'Institutional'} Plans
            </h2>
          </div>

          {/* Section 3: Pricing Cards */}
          <div className={`grid gap-6 fade-in-up-delayed-3 ${currentPlans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-3xl mx-auto'}`}>
            {currentPlans.map((plan) => {
               const isRecommended = plan.id === 'institution_multi' || plan.id === 'personal_10';
               const isElite = plan.id === 'institution_unlimited';
               const isEnterprise = plan.id === 'institution_unlimited';
              
              return (
                <div 
                  key={plan.id} 
                  className={`relative rounded-[2.5rem] p-8 border-2 transition-all hover:scale-[1.02] duration-300 ${
                    isEnterprise 
                      ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-primary-500/20' 
                      : isRecommended 
                        ? 'bg-white border-primary-500 shadow-2xl shadow-primary-600/10' 
                        : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary-600/40">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      isEnterprise ? 'bg-primary-500/20 text-primary-400' : 'bg-indigo-50 text-primary-600'
                    }`}>
                      {plan.id.includes('unlimited') ? <Star className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                    </div>

                    <p className={`text-xs font-black uppercase tracking-widest mb-2 ${
                      isEnterprise ? 'text-primary-400' : 'text-primary-600'
                    }`}>{plan.name}</p>
                    
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className={`text-4xl font-black tracking-tight ${isEnterprise ? 'text-white' : 'text-slate-900'}`}>₹{plan.price}</span>
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-8 ${isEnterprise ? 'text-slate-400' : 'text-slate-400'}`}>
                      Synced Credits: {plan.credits}
                    </p>

                    <ul className={`space-y-4 text-left mb-8 border-t pt-8 ${isEnterprise ? 'border-slate-800' : 'border-slate-50'}`}>
                      {plan.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3 text-sm font-medium">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isEnterprise ? 'bg-primary-500/20 text-primary-400' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            <Check className="w-3 h-3 stroke-[4]" />
                          </div>
                          <span className={isEnterprise ? 'text-slate-300' : 'text-slate-600'}>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                     <button
                       onClick={() => handlePurchase(plan.id)}
                       disabled={purchasing === plan.id}
                       className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 ${
                         isElite 
                           ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-600/30' 
                           : isRecommended
                             ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'
                             : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
                       }`}
                     >
                       {purchasing === plan.id ? (
                         <RefreshCw className="w-4 h-4 animate-spin" />
                       ) : (
                         <>
                           <CreditCard className="w-4 h-4" />
                           {tab === 'personal' ? 'Purchase Pack' : 'Upgrade Now'}
                         </>
                       )}
                     </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
