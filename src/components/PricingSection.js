'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Building2, CheckCircle, ArrowRight, CreditCard, Sparkles } from 'lucide-react';

const PricingSection = () => {
  const [isInstitutional, setIsInstitutional] = useState(false);

  const personalPlans = [
    {
      name: 'Intro Pack',
      price: '₹49',
      syncs: '3 Syncs',
      limit: '100 contacts/sync',
      desc: 'Perfect for a quick one-time sync.',
      features: ['100 contacts/sync', 'Lifetime Validity', 'Instant Activation'],
      recommended: false,
    },
    {
      name: 'Power Pack',
      price: '₹99',
      syncs: '10 Syncs',
      limit: '500 contacts/sync',
      desc: 'Most popular choice for active users.',
      features: ['500 contacts/sync', 'Lifetime Validity', 'Priority Support', 'Ad-free Experience'],
      recommended: true,
    },
  ];

  const institutionalPlans = [
    {
      name: 'Dept Starter',
      price: '₹199',
      syncs: '1 Organization',
      limit: '2,000 contacts/req',
      desc: 'Ideal for small teams and departments.',
      features: ['2,000 contacts/request', 'Admin Command Center', 'Team Member Management', 'Usage Analytics'],
      recommended: false,
    },
    {
      name: 'Enterprise',
      price: '₹499',
      syncs: 'Unlimited Hubs',
      limit: '50,000 contacts/req',
      desc: 'Full-scale solution for large institutions.',
      features: ['50,000 contacts/request', 'Unlimited Hubs/Teams', 'API Access', 'Dedicated Support Manager'],
      recommended: true,
    },
  ];

  const plans = isInstitutional ? institutionalPlans : personalPlans;

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="pricing">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary-100/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px] animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-primary-600 text-xs font-black uppercase tracking-widest mb-6">
            <CreditCard className="w-3.5 h-3.5" />
            Flexible Sync Options
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Plans for <span className="gradient-text">Everyone</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Choose the model that fits your needs. Your first sync is always free.
          </p>

          {/* Toggle Switch */}
          <div className="mt-12 flex justify-center">
            <div className="relative p-1 bg-slate-100 rounded-2xl flex items-center shadow-inner border border-slate-200">
              <button
                onClick={() => setIsInstitutional(false)}
                className={`relative z-10 px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl flex items-center gap-2 ${
                  !isInstitutional ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Smartphone className={`w-4 h-4 transition-transform ${!isInstitutional ? 'scale-110' : ''}`} />
                Personal
              </button>
              <button
                onClick={() => setIsInstitutional(true)}
                className={`relative z-10 px-8 py-3 text-sm font-bold transition-all duration-300 rounded-xl flex items-center gap-2 ${
                  isInstitutional ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className={`w-4 h-4 transition-transform ${isInstitutional ? 'scale-110' : ''}`} />
                Institutional
              </button>
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md border border-slate-200 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isInstitutional ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col ${
                plan.recommended
                  ? 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-900/20 scale-[1.02]'
                  : 'bg-white border-slate-100 text-slate-900 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 hover:scale-[1.01]'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-primary-600/30">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <p className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${
                  plan.recommended ? 'text-primary-400' : 'text-slate-400'
                }`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className={`text-sm font-bold ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>
                    / pack
                  </span>
                </div>
                <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-4 ${
                  plan.recommended ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-primary-50 text-primary-600 border border-primary-100'
                }`}>
                  {plan.syncs}
                </div>
                <p className={`text-sm font-medium leading-relaxed ${
                  plan.recommended ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {plan.desc}
                </p>
              </div>

              <div className={`h-px w-full mb-8 ${
                plan.recommended ? 'bg-slate-800' : 'bg-slate-100'
              }`} />

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      plan.recommended ? 'bg-primary-500/20 text-primary-400' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-bold ${
                      plan.recommended ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                  plan.recommended
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30'
                    : 'bg-slate-100 text-slate-900 hover:bg-primary-600 hover:text-white border border-slate-200'
                }`}
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 font-bold tracking-tight mb-4">
            Join 5,000+ users already using SyncBatch for their teams
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
