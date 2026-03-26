import Link from 'next/link';
import { Zap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Sync<span className="text-primary-400">Batch</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Fast, minimal, high-performance platform to sync contacts from Excel to mobile devices.
            </p>
            <p className="text-xs mt-4 flex items-center gap-1">
              We do not store your contacts permanently
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/credits" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link href="/organization" className="hover:text-primary-400 transition-colors">Organizations</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500">support@syncbatch.com</span></li>
              <li>
                <a href="https://inovuslabs.org/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                  INOVUS LABS IEDC
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SyncBatch. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            A product by{' '}
            <a href="https://inovuslabs.org/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              INOVUS LABS IEDC
            </a>
            <Heart className="w-3 h-3 text-danger" />
          </p>
        </div>
      </div>
    </footer>
  );
}
