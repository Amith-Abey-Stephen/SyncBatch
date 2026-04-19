'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Menu, X, Zap, LogOut, User, CreditCard, Building2, Shield, Trash2, ChevronDown, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, refreshUser, notifications } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/user/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast.success('Account scheduled for deletion');
        refreshUser();
        setDropdownOpen(false);
      }
    } catch (e) {
      toast.error('Failed to schedule deletion');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Sync<span className="text-primary-600">Batch</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/credits" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all flex items-center gap-1.5 border border-transparent hover:border-primary-100">
                  <CreditCard className="w-4 h-4 text-primary-500" />
                  <span className="tabular-nums">
                    {user.freeUsed ? `${user.credits} Credits` : '1 Free Sync'}
                  </span>
                </Link>
                <Link href="/organization" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all flex items-center gap-1.5 relative group">
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-primary-600" />
                  <span>Organization</span>
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                      {notifications}
                    </span>
                  )}
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all">
                  Dashboard
                </Link>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all ${
                      dropdownOpen ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center overflow-hidden">
                      {user.image && !imageError ? (
                        <img 
                          src={user.image} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <User className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 z-20 overflow-hidden py-1.5 animate-in fade-in zoom-in duration-150 origin-top-right">
                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account</p>
                          <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                        </div>
                        
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>

                        <div className="border-t border-slate-50 mt-1.5 pt-1.5">
                          <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.freeUsed ? `${user.credits} Credits` : '1 Free Sync'} available</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-primary-50">Dashboard</Link>
                <Link href="/credits" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-primary-50">Buy Credits</Link>
                <Link href="/organization" onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-primary-50">
                  <span>Organization</span>
                  {notifications > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm">
                      {notifications}
                    </span>
                  )}
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-primary-50">Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50">
                  Logout
                </button>
                <button onClick={() => { setShowDeleteModal(true); setMobileOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50">
                  Delete Account
                </button>
                <div className="pt-4">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-center text-white bg-primary-600 rounded-xl">
                    Go to Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-center text-white bg-primary-600 rounded-xl">
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="Your account will be scheduled for deletion in 10 days. You can cancel this by logging back in before then."
        confirmText="Schedule Deletion"
        type="danger"
      />
    </nav>
  );
}
