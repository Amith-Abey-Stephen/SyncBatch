'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import { Building2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function JoinOrgPage({ params }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const identifier = resolvedParams.orgId; // Param name is still orgId from folder
  const token = searchParams.get('token');

  const [joining, setJoining] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');
  const [orgInfo, setOrgInfo] = useState(null);
  const [fetchingOrg, setFetchingOrg] = useState(true);

  useEffect(() => {
    async function fetchOrgInfo() {
      try {
        const res = await fetch(`/api/org/public/${identifier}`);
        if (res.ok) {
          const data = await res.json();
          setOrgInfo(data);
        }
      } catch (e) {
        console.error('Failed to fetch org info', e);
      } finally {
        setFetchingOrg(false);
      }
    }
    fetchOrgInfo();
  }, [identifier]);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login, then back here
      router.push(`/login?redirect=/join/${identifier}?token=${token}`);
    }
  }, [user, loading, router, identifier, token]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch('/api/org/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || `You have joined ${orgInfo?.name || 'the organization'}!`);
        toast.success('Joined organization!');
        setTimeout(() => router.push('/organization'), 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to join');
        toast.error(data.error);
      }
    } catch (e) {
      setStatus('error');
      setMessage('Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  if (loading || !user || fetchingOrg) return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center pt-16">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-md w-full mx-4 fade-in-up">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
            {status === 'idle' && (
              <>
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Join {orgInfo?.name || 'Organization'}</h2>
                <p className="text-sm text-slate-500 mb-6">
                  {orgInfo?.description || `You've been invited to join ${orgInfo?.name || 'an organization'} on SyncBatch.`}
                </p>
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {joining ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Accept Invitation'}
                </button>
              </>
            )}
            {/* ... success and error states remain similar but with orgInfo usage if needed ... */}
            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Joined Successfully!</h2>
                <p className="text-sm text-slate-500">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Join Failed</h2>
                <p className="text-sm text-slate-500 mb-4">{message}</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all"
                >
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
