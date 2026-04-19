'use client';

import { useState } from 'react';
import { Send, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Message sent! We will contact you soon.');
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
    <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Send className="w-32 h-32 text-primary-600" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <input 
              required
              name="name"
              type="text" 
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              required
              name="email"
              type="email" 
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" 
              placeholder="john@example.com" 
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subject</label>
          <input 
            required
            name="subject"
            type="text" 
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold" 
            placeholder="How can we help?" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Message</label>
          <textarea 
            required
            name="message"
            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold resize-none" 
            rows={4} 
            placeholder="Your message here..." 
          />
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
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
  );
}
