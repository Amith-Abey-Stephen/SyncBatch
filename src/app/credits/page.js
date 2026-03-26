'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { CreditCard, Check, Zap, Users, Shield, Star, ArrowRight } from 'lucide-react';

const personalPlans = [
  { id: 'personal_3', name: '3 Syncs', credits: 3, price: 29, popular: false },
  { id: 'personal_10', name: '10 Syncs', credits: 10, price: 79, popular: true },
  { id: 'personal_25', name: '25 Syncs', credits: 25, price: 149, popular: false },
];

const institutionPlans = [
  { id: 'institution_50', name: '50 Sync Requests', credits: 50, price: 299, popular: false },
  { id: 'institution_200', name: '200 Sync Requests', credits: 200, price: 799, popular: true },
];

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
      // Create order
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

      // Load Razorpay
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
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '✕' });
          },
        },
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

  const plans = tab === 'personal' ? personalPlans : institutionPlans;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-4">
              <CreditCard className="w-4 h-4" />
              Credit Balance: <strong>{user.credits}</strong>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Buy Credits</h1>
            <p className="text-slate-500 max-w-lg mx-auto">
              Choose a credit pack that suits your needs. Each sync uses 1 credit.
            </p>
          </div>

          {/* Tab */}
          <div className="flex justify-center mb-10 fade-in-up-delayed">
            <div className="bg-slate-100 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setTab('personal')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'personal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Zap className="w-4 h-4" />
                Personal
              </button>
              <button
                onClick={() => setTab('institution')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === 'institution' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                Institution
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className={`grid gap-6 fade-in-up-delayed-2 ${plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-3xl mx-auto'}`}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                  plan.popular
                    ? 'border-primary-500 shadow-2xl shadow-primary-600/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-primary-200 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Best Value
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-slate-500 font-medium mb-2">{plan.name}</p>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-slate-900">₹{plan.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    ₹{(plan.price / plan.credits).toFixed(1)}/sync
                  </p>

                  <ul className="space-y-3 text-left mb-8">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {plan.credits} sync credits
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      Google & iPhone sync
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      Duplicate detection
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      Skipped contacts report
                    </li>
                  </ul>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasing === plan.id}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40'
                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    } disabled:opacity-50`}
                  >
                    {purchasing === plan.id ? (
                      <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <>
                        Buy Now
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="mt-10 text-center fade-in-up-delayed-2">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
              <Shield className="w-4 h-4" />
              Secure payments powered by Razorpay
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
