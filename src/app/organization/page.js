'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SkeletonCard } from '@/components/Skeletons';
import toast from 'react-hot-toast';
import {
  Building2, Users, Link2, Copy, Plus, Send, CheckCircle, Clock,
  XCircle, Upload, FileSpreadsheet, Zap, ArrowRight, X, RefreshCw,
  MoreVertical, ShieldCheck, Mail, ExternalLink, Activity, LogOut, Crown, Trash2, AlertTriangle, User, Eye, Shield, MessageSquare
} from 'lucide-react';

export default function OrganizationPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [orgs, setOrgs] = useState([]);
  const [activeOrgIdx, setActiveOrgIdx] = useState(0);
  const [orgLoading, setOrgLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Sync request state
  const [syncRequests, setSyncRequests] = useState({ incoming: [], sent: [] });
  const [reqTab, setReqTab] = useState('incoming');
  const [previewRequest, setPreviewRequest] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Modals
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'danger', title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchOrg = useCallback(async () => {
    try {
      const res = await fetch('/api/org');
      const data = await res.json();
      setOrgs(data.orgs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setOrgLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async (orgId) => {
    try {
      const url = orgId ? `/api/sync-requests?orgId=${orgId}` : '/api/sync-requests';
      const res = await fetch(url);
      const data = await res.json();
      setSyncRequests(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrg();
    }
  }, [user, fetchOrg]);

  useEffect(() => {
    if (user && orgs.length > 0) {
      const activeOrg = orgs[activeOrgIdx];
      fetchRequests(activeOrg?._id);

      // Poll for new requests every 10 seconds
      const interval = setInterval(() => fetchRequests(activeOrg?._id), 10000);
      return () => clearInterval(interval);
    }
  }, [user, orgs, activeOrgIdx, fetchRequests]);

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
        setOrgs([data.org, ...orgs]);
        setActiveOrgIdx(0);
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
    const org = orgs[activeOrgIdx];
    if (!org) return;
    const identifier = org.slug || org._id;
    const link = `${window.location.origin}/join/${identifier}?token=${org.inviteToken}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  const handleResetToken = async () => {
    const org = orgs[activeOrgIdx];
    if (!org) return;
    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Reset Invite Link?',
      message: 'This will invalidate the current invite link. All existing shared links will stop working.',
      confirmText: 'Reset Link',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/org/reset-token', { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
            const newOrgs = [...orgs];
            newOrgs[activeOrgIdx] = { ...org, inviteToken: data.inviteToken };
            setOrgs(newOrgs);
            toast.success('Invite link reset!');
          }
        } catch (e) {
          toast.error('Failed to reset link');
        }
      }
    });
  };

  const handleRemoveMember = async (userId) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Remove Member?',
      message: 'Are you sure you want to remove this member? They will lose access to the organization immediately.',
      confirmText: 'Remove Member',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/org/members/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
          if (res.ok) {
            toast.success('Member removed');
            fetchOrg();
          } else {
            const data = await res.json();
            toast.error(data.error);
          }
        } catch (e) {
          toast.error('Failed to remove member');
        }
      }
    });
  };

  const handleLeaveOrg = async (orgId) => {
    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Leave Organization?',
      message: 'Are you sure you want to leave this organization? You will lose access to team broadcasts immediately.',
      confirmText: 'Leave Now',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/org/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgId }),
          });
          if (res.ok) {
            toast.success('You have left the organization');
            fetchOrg();
          } else {
            const data = await res.json();
            toast.error(data.error);
          }
        } catch (e) {
          toast.error('Failed to leave organization');
        }
      }
    });
  };

  const handleTransferOwnership = async (userId) => {
    const org = orgs[activeOrgIdx];
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Transfer Ownership?',
      message: 'This will make another member the Admin. You will become a regular member and lose administrative control.',
      confirmText: 'Transfer Admin Rights',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/org/transfer-ownership', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgId: org._id, newOwnerId: userId }),
          });
          if (res.ok) {
            toast.success('Ownership transferred successfully');
            fetchOrg();
          } else {
            const data = await res.json();
            toast.error(data.error);
          }
        } catch (e) {
          toast.error('Transfer failed');
        }
      }
    });
  };

  const handleDeleteOrg = async (orgId) => {
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'Permanently Delete Organization?',
      message: 'This action cannot be undone. All members will be removed and broadcast history for this organization will be lost.',
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/org/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgId }),
          });
          if (res.ok) {
            toast.success('Organization deleted');
            fetchOrg();
          } else {
            const data = await res.json();
            toast.error(data.error);
          }
        } catch (e) {
          toast.error('Failed to delete organization');
        }
      }
    });
  };

  const handleRejectRequest = (requestId) => {
    setModalConfig({
      isOpen: true,
      type: 'warning',
      title: 'Reject Sync Request?',
      message: 'Are you sure you want to reject this request? You won\'t be able to sync this list unless it is sent again.',
      confirmText: 'Yes, Reject',
      onConfirm: () => handleRequestAction(requestId, 'ignore')
    });
  };

  const handleRequestAction = async (requestId, action) => {
    const req = syncRequests.incoming.find(r => r._id === requestId);
    if (action === 'sync') {
      setIsSyncing(true);
      setSyncMessage(req?.operation === 'delete' ? 'Removing contacts from your device...' : 'Syncing team contacts to your device...');
    }

    try {
      const res = await fetch(`/api/sync-requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === 'sync' ? (req?.operation === 'delete' ? 'Contacts removed!' : 'Sync complete!') : 'Request ignored');
        const activeOrg = orgs[activeOrgIdx];
        fetchRequests(activeOrg?._id);
        refreshUser();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Action failed');
      }
    } catch (e) {
      toast.error('Action failed');
    } finally {
      setIsSyncing(false);
      setSyncMessage('');
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
          <div className="mb-8 fade-in-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Building2 className="w-7 h-7 text-primary-600" />
                Organization
              </h1>
              <p className="text-slate-500 text-sm">Create or manage your organization and send sync requests to members</p>
            </div>
            <Link 
              href="/#contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white hover:text-primary-600 hover:border-primary-200 transition-all text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Need Help? Contact Support
            </Link>
          </div>

          {orgLoading ? (
            <SkeletonCard />
          ) : orgs.length > 0 ? (
            <div className="space-y-6 fade-in-up">
              {/* Org Switcher (if multiple) */}
              {orgs.length >= 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {orgs.map((o, idx) => (
                    <button
                      key={o._id}
                      onClick={() => setActiveOrgIdx(idx)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all shrink-0 border-2 ${
                        activeOrgIdx === idx 
                          ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {o.name}
                    </button>
                  ))}
                  {(() => {
                    const ownedOrgs = orgs.filter(o => o.ownerId === user._id).length;
                    const canCreate = user.role === 'admin' || ownedOrgs < user.maxOrgsLimit;
                    
                    return (
                      <button
                        onClick={() => {
                          if (canCreate) {
                            setShowCreateForm(true);
                          } else {
                            toast.error(`Plan Limit: You can own up to ${user.maxOrgsLimit} organizations. Redirecting to upgrade...`);
                            setTimeout(() => router.push('/credits?tab=org'), 1500);
                          }
                        }}
                        className="px-6 py-3 rounded-2xl text-sm font-black transition-all shrink-0 border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary-400 hover:text-primary-600 flex items-center gap-2 group"
                      >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Create New {user.maxOrgsLimit > 0 && `(${ownedOrgs}/${user.maxOrgsLimit})`}
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* Org Hero Card */}
              {(() => {
                const org = orgs[activeOrgIdx];
                return (
                  <>
              <div className="relative overflow-hidden bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Building2 className="w-64 h-64 text-primary-600" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center shadow-inner">
                        <Building2 className="w-10 h-10 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{org.name}</h2>
                          <span className="bg-primary-100 text-primary-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Institution</span>
                        </div>
                        <p className="text-slate-500 font-medium">{org.description || 'Enterprise contact synchronization hub'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-2xl font-black text-slate-800">{org.members?.length || 0}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Members</p>
                      </div>
                      <div className="w-px h-10 bg-slate-100 mx-2 hidden sm:block" />
                      <div className="text-right hidden sm:block">
                        <p className="text-2xl font-black text-primary-600">{syncRequests.sent?.length || 0}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Broadcasts</p>
                      </div>
                      <button 
                        onClick={() => { fetchOrg(); fetchRequests(); }}
                        className="ml-4 p-3 bg-slate-50 text-slate-400 hover:text-primary-600 rounded-2xl transition-all border border-slate-100 shadow-inner"
                        title="Refresh Command Center"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Broadcast Action Card */}
                {org.ownerId === user._id && (
                  <button
                    onClick={() => router.push('/dashboard?method=org')}
                    className="group relative bg-primary-600 rounded-[2rem] p-8 text-left overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary-600/20"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-20 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                      <Zap className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Broadcast New List</h3>
                      <p className="text-primary-100 text-sm leading-relaxed mb-6 max-w-[240px]">
                        Distribute contact lists to your entire team with a single broadcast request.
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-xl text-xs font-black uppercase tracking-wider">
                        Start Broadcast
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </button>
                )}

                {/* Invite Card */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                  <div className={`w-12 h-12 ${org.ownerId === user._id ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'} rounded-2xl flex items-center justify-center mb-6`}>
                    {org.ownerId === user._id ? <Users className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {org.ownerId === user._id ? 'Expand Your Team' : 'Member Access'}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    {org.ownerId === user._id 
                      ? 'Share this unique invite link with your colleagues to join the organization.' 
                      : 'You are a member of this organization. Only administrators can invite new colleagues.'}
                  </p>
                  
                  <div className="space-y-3">
                    {org.ownerId === user._id ? (
                      <>
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex-1 px-3 py-2 text-xs font-mono text-slate-500 truncate">
                            {org.slug || org._id}
                          </div>
                          <button
                            onClick={copyInviteLink}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </button>
                        </div>
                        <button
                          onClick={handleResetToken}
                          className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 px-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          REGENERATE SECURITY TOKEN
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active Member</span>
                        </div>
                        <button
                          onClick={() => handleLeaveOrg(org._id)}
                          className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 px-1 uppercase tracking-widest"
                        >
                          <LogOut className="w-3 h-3" />
                          Leave Organization
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Tabs */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="flex border-b border-slate-50 bg-slate-50/30">
                  {['Team Members', 'Broadcast Inbox', 'Broadcast History'].map((tab) => {
                    const id = tab === 'Team Members' ? 'members' : tab === 'Broadcast Inbox' ? 'incoming' : 'sent';
                    const isActive = reqTab === id || (id === 'members' && !['incoming', 'sent'].includes(reqTab));
                    return (
                      <button
                        key={tab}
                        onClick={() => setReqTab(id)}
                        className={`px-8 py-5 text-sm font-bold transition-all relative ${
                          isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab}
                        {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full mx-6" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-8">
                  {/* Members Tab */}
                  {(reqTab === 'members' || !['incoming', 'sent'].includes(reqTab)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                      {org.members.map((member) => (
                        <div key={member._id || member} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative">
                              {member.image && member.image !== "" ? (
                                <img src={member.image} alt={member.name} className="w-12 h-12 rounded-2xl object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">
                                  {member.name?.[0]}
                                </div>
                              )}
                              {org.ownerId === member._id && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white" title="Owner">
                                  <ShieldCheck className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5" />
                                {member.email}
                              </p>
                            </div>
                          </div>
                          
                          {org.ownerId === user._id && member._id !== user._id && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleTransferOwnership(member._id)}
                                className="px-3 py-1.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                                title="Transfer Admin"
                              >
                                <Crown className="w-3 h-3" />
                                Make Admin
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member._id)}
                                className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Incoming Tab */}
                  {reqTab === 'incoming' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      {syncRequests.incoming?.length > 0 ? (
                        syncRequests.incoming.map((req) => {
                          const myTarget = req.targetUsers?.find(t => t.userId?.toString() === user._id || t.userId?._id === user._id);
                          return (
                            <div key={req._id} className={`relative overflow-hidden rounded-[2rem] p-6 sm:p-8 border-2 transition-all group/card ${
                              req.operation === 'delete' 
                                ? 'bg-red-50/30 border-red-100 hover:border-red-300' 
                                : 'bg-white border-slate-100 hover:border-primary-300 shadow-xl shadow-slate-200/40'
                            }`}>
                              {/* Operation Type Background Icon */}
                              <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover/card:scale-110 transition-transform duration-700 pointer-events-none">
                                {req.operation === 'delete' ? <Trash2 className="w-32 h-32 text-red-600" /> : <Zap className="w-32 h-32 text-primary-600" />}
                              </div>

                              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
                                    req.operation === 'delete' ? 'bg-red-100 text-red-600' : 'bg-primary-50 text-primary-600'
                                  }`}>
                                    {req.operation === 'delete' ? <Trash2 className="w-7 h-7" /> : <FileSpreadsheet className="w-7 h-7" />}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <h3 className="text-lg font-black text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-md">
                                        {req.listId?.title || 'Contact List'}
                                      </h3>
                                      {req.operation === 'delete' ? (
                                        <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-600/20">Removing Contacts</span>
                                      ) : (
                                        <span className="bg-primary-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary-600/20">Adding Contacts</span>
                                      )}
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-2">
                                      <div className="flex -space-x-2">
                                        <div className="w-5 h-5 bg-slate-200 rounded-full border-2 border-white flex items-center justify-center text-[8px]">
                                          {req.requestedBy?.name?.[0]}
                                        </div>
                                      </div>
                                      Sent by <span className="text-slate-800 font-bold">{req.requestedBy?.name}</span> • <span className="text-primary-600 font-bold">{req.listId?.contacts?.length || 0} contacts</span>
                                    </div>
                                    <button 
                                      onClick={() => setPreviewRequest(req)}
                                      className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      Preview Contacts
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 self-end md:self-center">
                                  {myTarget?.status === 'pending' ? (
                                    <>
                                      <button
                                        onClick={() => handleRequestAction(req._id, 'sync')}
                                        className={`px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg ${
                                          req.operation === 'delete' 
                                            ? 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700' 
                                            : 'bg-primary-600 text-white shadow-primary-600/20 hover:bg-primary-700'
                                        }`}
                                      >
                                        {req.operation === 'delete' ? 'Delete Now' : 'Sync Now'}
                                      </button>
                                      <button
                                        onClick={() => handleRejectRequest(req._id)}
                                        className="px-6 py-3.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest ${
                                      myTarget?.status === 'done' 
                                        ? (req.operation === 'delete' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600')
                                        : 'bg-slate-50 border-slate-100 text-slate-400'
                                    }`}>
                                      {myTarget?.status === 'done' ? (
                                        <>
                                          <CheckCircle className="w-4 h-4" />
                                          {req.operation === 'delete' ? 'Successfully Removed' : 'Successfully Synced'}
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-4 h-4" />
                                          Request Ignored
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem]">
                          <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold tracking-tight">Your broadcast inbox is empty</p>
                          <p className="text-xs text-slate-300 mt-1">New lists from your team will appear here</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* History Tab */}
                  {reqTab === 'sent' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      {syncRequests.sent?.length > 0 ? (
                        syncRequests.sent.map((req) => (
                          <div key={req._id} className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100">
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <p className="font-bold text-slate-800">{req.listId?.title || 'Contact List'}</p>
                                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {req.targetUsers?.map((target) => (
                                    <div key={target._id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                      target.status === 'done' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-600/5'
                                        : target.status === 'ignored' ? 'bg-red-50 border-red-100 text-red-700'
                                        : 'bg-white border-slate-200 text-slate-500'
                                    }`}>
                                      {target.status === 'done' ? <CheckCircle className="w-2.5 h-2.5" />
                                        : target.status === 'ignored' ? <XCircle className="w-2.5 h-2.5" />
                                        : <Clock className="w-2.5 h-2.5 animate-pulse" />
                                      }
                                      {target.userId?.name || 'User'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="lg:w-48 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-xl font-black text-primary-600">
                                  {req.targetUsers?.length > 0 
                                    ? Math.round((req.targetUsers?.filter(t => t.status === 'done').length / req.targetUsers?.length) * 100) 
                                    : 0}%
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Adoption Rate</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem]">
                          <Send className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold tracking-tight">No broadcasts sent yet</p>
                          <button onClick={() => router.push('/dashboard?method=org')} className="text-xs text-primary-500 font-bold mt-2 hover:underline">
                            Create your first broadcast →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                {/* Danger Zone */}
                {org.ownerId === user._id && (
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="bg-red-50 rounded-[1.5rem] p-6 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-red-900 uppercase tracking-wider">Danger Zone</h4>
                          <p className="text-xs text-red-600 font-medium mt-0.5">Deleting the organization will remove all members and data permanently.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteOrg(org._id)}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                      >
                        Delete Organization
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </div>
                  </>
                );
              })()}
            </div>
          ) : (
            // No org at all - show creation landing
            <div className="fade-in-up">
              {!(user.role === 'admin' || user.maxOrgsLimit >= 1) ? (
                <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 text-center max-w-lg mx-auto overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Zap className="w-32 h-32 text-primary-600" />
                   </div>
                   <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Building2 className="w-8 h-8 text-primary-600" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Institution Mode Locked</h2>
                   <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                      Organization features like member invites and bulk sync broadcasts are only available on <strong>Institutional Plans</strong>.
                   </p>
                   <button
                     onClick={() => router.push('/credits?tab=org')}
                     className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-primary-500/20 transition-all text-sm"
                   >
                     Upgrade to Institution Plan
                     <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">No Organization Yet</h2>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    You have an active plan. Create your first organization to start broadcasting lists to your team.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create Organization
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Global Create Form Overlay */}
          {showCreateForm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-300">
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-primary-600" />
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-2">Create New Organization</h2>
                <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">
                  Set up a new synchronization hub for your team. This requires an active <strong>Institutional Plan</strong>.
                </p>
                
                <form onSubmit={handleCreateOrg} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold placeholder:font-medium placeholder:text-slate-300"
                      placeholder="e.g. Sales Team Alpha"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Short Description</label>
                    <textarea
                      value={orgDesc}
                      onChange={(e) => setOrgDesc(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-primary-600 focus:bg-white transition-all font-bold placeholder:font-medium placeholder:text-slate-300 resize-none"
                      placeholder="What is this team for?"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-600/20 text-xs uppercase tracking-widest hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Launch Organization
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Syncing Modal */}
      {isSyncing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Processing...</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
              {syncMessage}
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-3 rounded-2xl border border-slate-100">
              <Shield className="w-3.5 h-3.5 text-primary-600" />
              Secure Sync in Progress
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${previewRequest.operation === 'delete' ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'} rounded-2xl flex items-center justify-center shadow-sm`}>
                  {previewRequest.operation === 'delete' ? <Trash2 className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">{previewRequest.listId?.title || 'Contact List'}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {previewRequest.operation === 'delete' ? 'Deletions' : 'Additions'} • {previewRequest.listId?.contacts?.length} Contacts
                  </p>
                </div>
              </div>
              <button onClick={() => setPreviewRequest(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {previewRequest.listId?.contacts?.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-transparent hover:border-primary-100 hover:bg-white transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-xs font-black text-primary-600 border border-slate-100 shadow-sm">
                        {contact.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{contact.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{contact.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-medium max-w-[160px]">
                Review the list carefully before proceeding.
              </p>
              <button
                onClick={() => setPreviewRequest(null)}
                className="px-8 py-3.5 bg-white text-slate-600 font-black rounded-2xl border-2 border-slate-100 hover:border-primary-200 hover:text-primary-600 transition-all text-xs uppercase tracking-widest"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
      
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />
    </>
  );
}
