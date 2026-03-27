'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SkeletonDashboard } from '@/components/Skeletons';
import toast from 'react-hot-toast';
import { 
  Users, Building2, CreditCard, Send, Shield, Zap, TrendingUp, 
  BarChart3, RefreshCw, ChevronRight, Activity, Database
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        toast.error(data.error || 'Failed to fetch admin stats');
      }
    } catch (e) {
      toast.error('Admin API error');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, fetchStats]);

  if (loading || statsLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-12 max-w-7xl mx-auto px-4">
          <SkeletonDashboard />
        </main>
      </>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 fade-in-up">
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-600" />
              Admin Control Center
            </h1>
            <p className="text-slate-500">Overview of system health, revenue, and platform growth.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 fade-in-up-delayed">
            {[
              { label: 'Total Revenue', value: stats.stats.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Platform Users', value: stats.stats.totalUsers, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
              { label: 'Organizations', value: stats.stats.totalOrgs, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Sync Operations', value: stats.stats.syncRequests, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-slate-200" />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 font-heading">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-10 fade-in-up-delayed-2">
            {/* Recent Users */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <Users className="w-5 h-5 text-primary-600" />
                   Recent Registrations
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {stats.recentUsers.map((u, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-primary-600">{u.credits} CR</p>
                      <p className="text-[10px] text-slate-400 capitalize">{new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-green-600" />
                   Recent Transactions
                </h3>
              </div>
              <div className="divide-y divide-slate-50 text-sm">
                {stats.recentTransactions.map((t, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{t.userId?.name || 'Deleted User'}</p>
                      <p className="text-xs text-slate-400 font-mono">{t.paymentId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-600">₹{t.amount}</p>
                      <p className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Platform Stats */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden fade-in-up-delayed-2">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <Database className="w-64 h-64" />
             </div>
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-primary-400" />
                  Platform Health & Scale
               </h3>
               <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Stored Contact Lists</label>
                    <p className="text-4xl font-black">{stats.stats.contactLists}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Completed Sync Requests</label>
                    <p className="text-4xl font-black">{stats.stats.totalTransactions}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Platform Scale</label>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-full bg-slate-700 rounded-full">
                           <div className="h-full w-2/3 bg-primary-500 rounded-full" />
                        </div>
                        <span className="text-xs font-bold text-primary-400">High</span>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
