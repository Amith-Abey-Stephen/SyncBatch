import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Upload, Smartphone, Shield, Zap, Users, CreditCard, CheckCircle, ArrowRight, FileSpreadsheet, RefreshCw, Building2, Mail, Send } from 'lucide-react';
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center hero-pattern overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-[120px] animate-float-delayed" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" />
                  <span>Lightning-fast contact sync</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 mb-6">
                  Sync Contacts from{' '}
                  <span className="gradient-text">Excel to Phone</span>
                  {' '}Instantly
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                  Upload your Excel file, preview contacts, and sync them directly to Android or iPhone. No manual typing. No duplicates. Just fast, reliable sync.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-2xl shadow-xl shadow-primary-600/25 hover:shadow-primary-600/40 hover:from-primary-700 hover:to-primary-800 transition-all text-sm"
                  >
                    Start Syncing Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:border-primary-300 hover:text-primary-700 transition-all text-sm shadow-sm"
                  >
                    How it works
                  </Link>
                </div>
                <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  We do not store your contacts permanently
                </p>
              </div>

              {/* Hero visual */}
              <div className="fade-in-up-delayed hidden lg:block">
                <div className="relative">
                  <div className="glass-card rounded-3xl p-8 animate-float">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Sync Complete!</p>
                        <p className="text-xs text-slate-500">247 contacts added</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {['John Smith', 'Sarah Johnson', 'Mike Chen'].map((name, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                              {name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{name}</p>
                              <p className="text-xs text-slate-400">+91 98765 4321{i}</p>
                            </div>
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      ))}
                      <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">
                            D
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">David Park</p>
                            <p className="text-xs text-slate-400">Already exists</p>
                          </div>
                        </div>
                        <RefreshCw className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                How SyncBatch Works
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Three simple steps to sync all your contacts. No technical knowledge required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: FileSpreadsheet,
                  step: '01',
                  title: 'Upload Excel',
                  desc: 'Upload your .xlsx or .csv file containing contact names and phone numbers.',
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  icon: Upload,
                  step: '02',
                  title: 'Preview & Select',
                  desc: 'Preview parsed contacts, remove unwanted ones, and choose your sync method.',
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  icon: Smartphone,
                  step: '03',
                  title: 'Sync to Phone',
                  desc: 'Contacts sync directly to Google Contacts or download as VCF for iPhone.',
                  color: 'from-green-500 to-emerald-500',
                },
              ].map((item, i) => (
                <div key={i} className="group relative bg-white rounded-2xl p-8 border border-slate-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-300">
                  <div className="absolute -top-4 -right-4 text-7xl font-black text-slate-50 group-hover:text-primary-50 transition-colors">
                    {item.step}
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Built for Speed & Simplicity
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Everything you need to manage and sync contacts, whether for personal use or as an institution.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: 'Lightning Fast', desc: 'Batch processing syncs contacts in parallel. No waiting.', color: 'bg-amber-100 text-amber-600' },
                { icon: Shield, title: 'Privacy First', desc: "We don't store your contacts. They go directly to your phone.", color: 'bg-green-100 text-green-600' },
                { icon: RefreshCw, title: 'Smart Dedup', desc: 'Automatically detects and skips duplicate contacts.', color: 'bg-blue-100 text-blue-600' },
                { icon: Smartphone, title: 'Multi-Platform', desc: 'Works with Android (Google Contacts) and iPhone (VCF).', color: 'bg-purple-100 text-purple-600' },
                { icon: Users, title: 'Organization Mode', desc: 'Create teams, invite members, and send sync requests.', color: 'bg-pink-100 text-pink-600' },
                { icon: CreditCard, title: 'Fair Pricing', desc: 'Pay per sync with affordable credit packs. First sync is free!', color: 'bg-cyan-100 text-cyan-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:border-primary-100 transition-all duration-300 group">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Pricing Hub */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-[100px] opacity-50" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-[100px] opacity-50" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-primary-600 text-xs font-black uppercase tracking-widest mb-6">
                <CreditCard className="w-3.5 h-3.5" />
                Transparent Pricing
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Plans for Everyone
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                Choose the model that fits your needs. Your first sync is always free.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Personal Column */}
              <div className="space-y-8 fade-in-up">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-primary-100 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <Smartphone className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Sync</h3>
                    <p className="text-sm text-slate-500 font-medium">Direct device connection for individuals.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Intro Pack', price: '₹29', syncs: '3 Syncs', limit: '100 contacts/sync' },
                    { name: 'Power Pack', price: '₹79', syncs: '10 Syncs', limit: '500 contacts/sync', recommended: true },
                  ].map((plan, i) => (
                    <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all ${plan.recommended ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${plan.recommended ? 'text-primary-200' : 'text-slate-400'}`}>{plan.name}</p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-black">{plan.price}</span>
                      </div>
                      <p className={`text-xs font-bold mb-4 ${plan.recommended ? 'text-primary-100' : 'text-primary-600'}`}>{plan.syncs}</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-[11px] font-bold">
                          <CheckCircle className={`w-3.5 h-3.5 ${plan.recommended ? 'text-white' : 'text-emerald-500'}`} />
                          {plan.limit}
                        </li>
                        <li className="flex items-center gap-2 text-[11px] font-bold">
                          <CheckCircle className={`w-3.5 h-3.5 ${plan.recommended ? 'text-white' : 'text-emerald-500'}`} />
                          Lifetime Validity
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institutional Column */}
              <div className="space-y-8 fade-in-up-delayed">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-purple-100 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <Building2 className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Sync</h3>
                    <p className="text-sm text-slate-500 font-medium">Team-wide hubs for departments & campus.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: 'Dept Starter', price: '₹499', orgs: '1 Organization', limit: '2,000 contacts' },
                    { name: 'Enterprise', price: '₹4,999', orgs: 'Unlimited Hubs', limit: '50,000 contacts', enterprise: true },
                  ].map((plan, i) => (
                    <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all ${plan.enterprise ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${plan.enterprise ? 'text-primary-400' : 'text-slate-400'}`}>{plan.name}</p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-3xl font-black">{plan.price}</span>
                      </div>
                      <p className={`text-xs font-bold mb-4 ${plan.enterprise ? 'text-primary-400' : 'text-purple-600'}`}>{plan.orgs}</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-[11px] font-bold">
                          <CheckCircle className={`w-3.5 h-3.5 ${plan.enterprise ? 'text-primary-400' : 'text-emerald-500'}`} />
                          {plan.limit}/request
                        </li>
                        <li className="flex items-center gap-2 text-[11px] font-bold">
                          <CheckCircle className={`w-3.5 h-3.5 ${plan.enterprise ? 'text-primary-400' : 'text-emerald-500'}`} />
                          Admin Command Center
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/credits"
                className="inline-flex items-center gap-3 px-10 py-5 bg-primary-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary-600/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all text-sm uppercase tracking-widest"
              >
                View All Plans & Features
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="mt-6 text-sm text-slate-400 font-bold tracking-tight">
                Join 5,000+ users already using SyncBatch for their teams
              </p>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="py-24 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 border border-primary-200 rounded-full text-primary-600 text-xs font-black uppercase tracking-widest mb-6">
                  <Mail className="w-3.5 h-3.5" />
                  Get In Touch
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                  We&apos;re here to <br /><span className="text-primary-600">help you sync.</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed font-medium mb-10 max-w-lg">
                  Have questions about our institutional plans or need technical support? Our team is ready to assist you.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Mail, title: 'Email Support', detail: 'support@syncbatch.com', desc: 'Response within 24 hours' },
                    { icon: Shield, title: 'Security First', detail: 'Enterprise-grade encryption', desc: 'Your data is always private' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                        <item.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.detail}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fade-in-up-delayed">
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Send className="w-32 h-32 text-primary-600" />
                  </div>
                  
                  <form className="space-y-5 relative z-10">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                        <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input type="email" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subject</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" placeholder="How can we help?" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Message</label>
                      <textarea className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold resize-none" rows={4} placeholder="Your message here..." />
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                      Send Message
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Sync Your Contacts?
            </h2>
            <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of students, teachers, and institutions who save hours by syncing contacts instantly.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl shadow-2xl shadow-black/20 hover:bg-primary-50 transition-all text-sm"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
