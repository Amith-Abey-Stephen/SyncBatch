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
          <div className="flex justify-center mb-12 fade-in-up-delayed-2">
            <div className="relative p-1 bg-slate-100 rounded-2xl flex items-center shadow-inner border border-slate-200">
              <button
                onClick={() => setTab('personal')}
                className={`relative z-10 px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl flex items-center gap-2 ${
                  tab === 'personal' ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Smartphone className={`w-4 h-4 ${tab === 'personal' ? 'scale-110' : ''}`} />
                Personal
              </button>
              <button
                onClick={() => setTab('institution')}
                className={`relative z-10 px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl flex items-center gap-2 ${
                  tab === 'institution' ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className={`w-4 h-4 ${tab === 'institution' ? 'scale-110' : ''}`} />
                Institutional
              </button>
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md border border-slate-200 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  tab === 'institution' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="text-center mb-10 fade-in-up-delayed-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Choose your <span className="text-primary-600">{tab === 'personal' ? 'Personal' : 'Institutional'} Hub</span>
            </h2>
          </div>

          <div className={`grid gap-8 fade-in-up-delayed-3 ${currentPlans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'}`}>
            {currentPlans.map((plan) => {
               const isRecommended = plan.id === 'institution_unlimited' || plan.id === 'personal_10';
               const isEnterprise = plan.id === 'institution_unlimited';
              
              return (
                <div 
                  key={plan.id} 
                  className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col ${
                    isEnterprise 
                      ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-900/20 scale-[1.02]' 
                      : 'bg-white border-slate-100 text-slate-900 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 hover:scale-[1.01]'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-primary-600/30">
                      <Zap className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}
 
                  <div className="mb-8 text-center">
                    <p className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${
                      isEnterprise ? 'text-primary-400' : 'text-primary-600'
                    }`}>
                      {plan.name}
                    </p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-5xl font-black">₹{plan.price}</span>
                      <span className={`text-sm font-bold ${isEnterprise ? 'text-slate-400' : 'text-slate-500'}`}>
                        / pack
                      </span>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-4 ${
                      isEnterprise ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-primary-50 text-primary-600 border border-primary-100'
                    }`}>
                      {plan.credits} Credits
                    </div>
                  </div>
 
                  <div className={`h-px w-full mb-8 ${
                    isEnterprise ? 'bg-slate-800' : 'bg-slate-100'
                  }`} />
 
                  <ul className="space-y-4 mb-10 flex-grow">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isEnterprise ? 'bg-primary-500/20 text-primary-400' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          <Check className="w-3 h-3 stroke-[4]" />
                        </div>
                        <span className={`text-sm font-bold ${
                          isEnterprise ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
 
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasing === plan.id}
                    className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                      isEnterprise
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30'
                        : 'bg-slate-100 text-slate-900 hover:bg-primary-600 hover:text-white border border-slate-200'
                    } disabled:opacity-50`}
                  >
                    {purchasing === plan.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Purchase Pack
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
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
