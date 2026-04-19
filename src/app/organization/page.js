'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SkeletonCard } from '@/components/Skeletons';
import toast from 'react-hot-toast';
import {
  Building2, Users, Link2, Copy, Plus, Send, CheckCircle, Clock,
  XCircle, Upload, FileSpreadsheet, Zap, ArrowRight, X, RefreshCw
} from 'lucide-react';

export default function OrganizationPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [org, setOrg] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Sync request state
  const [syncRequests, setSyncRequests] = useState({ incoming: [], sent: [] });
  const [reqTab, setReqTab] = useState('incoming');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchOrg = useCallback(async () => {
    try {
      const res = await fetch('/api/org');
      const data = await res.json();
      setOrg(data.org);
    } catch (e) {
      console.error(e);
    } finally {
      setOrgLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/sync-requests');
      const data = await res.json();
      setSyncRequests(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrg();
      fetchRequests();
    }
  }, [user, fetchOrg, fetchRequests]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error('Organization name is required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, description: orgDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrg(data.org);
        toast.success('Organization created!');
        setShowCreateForm(false);
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const copyInviteLink = () => {
    if (!org) return;
    const identifier = org.slug || org._id;
    const link = `${window.location.origin}/join/${identifier}?token=${org.inviteToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  const handleResetToken = async () => {
    if (!confirm('This will invalidate the current invite link. Continue?')) return;
    try {
      const res = await fetch('/api/org/reset-token', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setOrg({ ...org, inviteToken: data.inviteToken });
        toast.success('Invite link reset!');
      }
    } catch (e) {
      toast.error('Failed to reset link');
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const res = await fetch(`/api/sync-requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === 'sync' ? 'Sync started!' : 'Request ignored');
        fetchRequests();
      }
    } catch (e) {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-12 max-w-5xl mx-auto px-4">
          <SkeletonCard />
        </main>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-12 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 fade-in-up">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-primary-600" />
              Organization
            </h1>
            <p className="text-slate-500 text-sm">Create or manage your organization and send sync requests to members</p>
          </div>

          {orgLoading ? (
            <SkeletonCard />
          ) : org ? (
            <div className="space-y-6 fade-in-up">
              {/* Org Info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{org.name}</h2>
                    {org.description && <p className="text-sm text-slate-500 mt-1">{org.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {org.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyInviteLink}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Invite Link
                    </button>
                    <button
                      onClick={handleResetToken}
                      title="Reset Invite Link"
                      className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Members */}
                {org.members && org.members.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Members</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {org.members.map((member) => (
                        <div key={member._id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
                              {member.name?.[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{member.name}</p>
                            <p className="text-xs text-slate-400 truncate">{member.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Requests */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary-600" />
                    Sync Requests
                  </h3>
                </div>

                <div className="border-b border-slate-100">
                  <div className="flex">
                    <button
                      onClick={() => setReqTab('incoming')}
                      className={`flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                        reqTab === 'incoming' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Incoming
                    </button>
                    <button
                      onClick={() => setReqTab('sent')}
                      className={`flex-1 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                        reqTab === 'sent' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Sent
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {reqTab === 'incoming' && (
                    syncRequests.incoming?.length > 0 ? (
                      <div className="space-y-3">
                        {syncRequests.incoming.map((req) => {
                          const myTarget = req.targetUsers?.find(t => t.userId?.toString() === user._id || t.userId?._id === user._id);
                          return (
                            <div key={req._id} className="bg-slate-50 rounded-xl p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">{req.listId?.title || 'Contact List'}</p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    From: {req.requestedBy?.name} • {req.listId?.contacts?.length || 0} contacts
                                  </p>
                                </div>
                                {myTarget?.status === 'pending' ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleRequestAction(req._id, 'sync')}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-all"
                                    >
                                      <Zap className="w-3 h-3" />
                                      Sync Now
                                    </button>
                                    <button
                                      onClick={() => handleRequestAction(req._id, 'ignore')}
                                      className="px-3 py-1.5 text-slate-400 hover:text-danger rounded-lg text-xs font-semibold hover:bg-red-50 transition-all"
                                    >
                                      Ignore
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                    myTarget?.status === 'done' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {myTarget?.status === 'done' ? 'Synced' : 'Ignored'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No incoming sync requests
                      </div>
                    )
                  )}

                  {reqTab === 'sent' && (
                    syncRequests.sent?.length > 0 ? (
                      <div className="space-y-3">
                        {syncRequests.sent.map((req) => (
                          <div key={req._id} className="bg-slate-50 rounded-xl p-4">
                            <p className="text-sm font-semibold text-slate-800 mb-2">{req.listId?.title || 'Contact List'}</p>
                            <div className="flex flex-wrap gap-2">
                              {req.targetUsers?.map((target) => (
                                <span key={target.userId?._id || target.userId} className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                                  target.status === 'done' ? 'bg-green-50 text-green-700'
                                    : target.status === 'ignored' ? 'bg-red-50 text-red-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {target.status === 'done' ? <CheckCircle className="w-3 h-3" />
                                    : target.status === 'ignored' ? <XCircle className="w-3 h-3" />
                                    : <Clock className="w-3 h-3" />
                                  }
                                  {target.userId?.name || 'User'}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        <Send className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No sent sync requests
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            // No org - show create form
            <div className="fade-in-up">
              {!(user.role === 'admin' || user.maxContactsLimit >= 2000) ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xl shadow-slate-200/50 text-center max-w-lg mx-auto overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Zap className="w-32 h-32 text-primary-600" />
                   </div>
                   <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Building2 className="w-8 h-8 text-purple-600" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Institution Mode Locked</h2>
                   <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                      Organization features like member invites and bulk sync requests are only available on <strong>Institutional Plans</strong>.
                   </p>
                   <button
                     onClick={() => router.push('/credits')}
                     className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-primary-500/20 transition-all text-sm"
                   >
                     Upgrade to Institution Plan
                     <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              ) : showCreateForm ? (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm max-w-lg mx-auto">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    Create Organization
                  </h2>
                  <form onSubmit={handleCreateOrg} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="e.g. CS Department"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
                      <textarea
                        value={orgDesc}
                        onChange={(e) => setOrgDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        placeholder="Brief description..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={creating}
                        className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Create
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-3 text-slate-500 font-medium text-sm hover:bg-slate-50 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">No Organization Yet</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Create an organization to invite members and send bulk sync requests.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Organization
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
