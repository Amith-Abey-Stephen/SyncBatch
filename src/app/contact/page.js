'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MessageSquare, Phone, Send, MapPin, Globe, Clock, Shield, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      type: formData.get('type'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Message sent! Our team will get back to you soon.');
        e.target.reset();
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-slate-900">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#4f46e5_0%,transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,#9333ea_0%,transparent_50%)]" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tight">
              Get in <span className="text-primary-500">Touch</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
              Have questions about SyncBatch? Whether you're an individual user or a large institution, we're here to help you bridge the gap between your data and your devices.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-24 relative -mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                {[
                  { 
                    icon: Mail, 
                    title: 'Email Us', 
                    detail: 'support@inovuslabs.org', 
                    desc: 'For general inquiries and support requests.',
                    color: 'bg-blue-50 text-blue-600'
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all duration-300">
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-primary-600 font-bold mb-2">{item.detail}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}

                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Globe className="w-24 h-24" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 relative z-10">Global Reach</h3>
                  <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                    SyncBatch is used by teams in over 15 countries. Our distributed support team ensures you get answers when you need them.
                  </p>
                  <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full w-fit relative z-10">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">System Status: Optimal</span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-2xl shadow-slate-200/60 h-full">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Send us a message</h2>
                    <p className="text-slate-500 font-medium">Complete the form below and we'll route your request to the right team member.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          required
                          name="name"
                          type="text" 
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" 
                          placeholder="What should we call you?" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          required
                          name="email"
                          type="email" 
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" 
                          placeholder="Where can we reach you?" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Type</label>
                      <select name="type" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold appearance-none">
                        <option>Technical Support</option>
                        <option>Billing & Credits</option>
                        <option>Institutional/Enterprise Inquiry</option>
                        <option>Feature Request</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea 
                        required
                        name="message"
                        rows={6}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold resize-none" 
                        placeholder="Tell us more about how we can help..." 
                      />
                    </div>

                    <button 
                      disabled={loading}
                      type="submit" 
                      className="w-full py-5 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Office Locations / More Info */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 text-[10px] font-black uppercase tracking-widest mb-8">
              <MapPin className="w-3.5 h-3.5" />
              Our Hub
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Main Headquarters</h2>
            <p className="text-slate-500 font-medium mb-12 max-w-xl mx-auto">
              Operated by the innovative team at INOVUS LABS, dedicated to building tools that solve real-world synchronization challenges.
            </p>
            
            <div className="max-w-3xl mx-auto bg-white rounded-[2rem] p-8 border border-slate-100 shadow-lg text-left flex flex-col sm:flex-row items-center gap-8">
              <div className="w-full sm:w-1/3 h-48 bg-slate-200 rounded-2xl overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
                <img 
                  src="/inovus.webp" alt="Office" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-800 mb-2">INOVUS LABS IEDC</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Kristu Jyoti College of <br /> Management and Technology, <br />
                  Changanassery, Kerala, India - 686104
                </p>
                <div className="flex items-center gap-4">
                  <a href="mailto:support@inovuslabs.org" className="text-primary-600 font-bold text-sm hover:underline flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    support@inovuslabs.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
