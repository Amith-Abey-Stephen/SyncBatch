import Link from 'next/link';
import { Zap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">
                Sync<span className="text-primary-500">Batch</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 font-medium">
              The high-performance synchronization hub for teams and individuals. Effortlessly bridge the gap between Excel and mobile devices.
            </p>
            <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full w-fit">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Live & Secure</span>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-black text-white mb-6 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/dashboard" className="hover:text-primary-500 transition-all hover:translate-x-1 inline-block">Sync Center</Link></li>
              <li><Link href="/credits" className="hover:text-primary-500 transition-all hover:translate-x-1 inline-block">Pricing Hub</Link></li>
              <li><Link href="/organization" className="hover:text-primary-500 transition-all hover:translate-x-1 inline-block">Team Management</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-black text-white mb-6 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/privacy" className="hover:text-primary-500 transition-all hover:translate-x-1 inline-block">Privacy Shield</Link></li>
              <li><Link href="/terms" className="hover:text-primary-500 transition-all hover:translate-x-1 inline-block">Service Terms</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-black text-white mb-6 uppercase tracking-widest">Connect</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li className="text-slate-500 break-all">inovuslabs@kjcmt.ac.in</li>
              <li>
                <a href="https://inovuslabs.org/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white hover:bg-slate-700 transition-all inline-block">
                  Visit INOVUS LABS
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/50 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            © {new Date().getFullYear()} SyncBatch Engine. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-danger animate-pulse" />
            <span>at</span>
            <a href="https://inovuslabs.org/" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-400 transition-colors">
              INOVUS LABS IEDC
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
