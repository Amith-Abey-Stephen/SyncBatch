'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SkeletonDashboard } from '@/components/Skeletons';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  Upload, FileSpreadsheet, Smartphone, Monitor, CheckCircle, XCircle,
  AlertTriangle, CreditCard, ArrowRight, Download, Eye, ChevronDown,
  Zap, Shield, RefreshCw, X, Users, Trash2, Plus
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState('upload'); // upload, preview, method, syncing, results
  const [contacts, setContacts] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [filename, setFilename] = useState('');
  const [syncMethod, setSyncMethod] = useState('google');
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [syncResults, setSyncResults] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [operation, setOperation] = useState('add'); // add, delete
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }

      setContacts(data.contacts);
      setParseErrors(data.errors);
      setFilename(data.filename);
      setStep('preview');
      toast.success(`${data.total} contacts found`);
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSync = async () => {
    // Check credits
    const hasCredits = !user.freeUsed || user.credits > 0;
    if (!hasCredits) {
      toast.error('No credits remaining. Please buy more credits.');
      router.push('/credits');
      return;
    }

    setSyncing(true);
    setStep('syncing');
    setSyncProgress({ current: 0, total: contacts.length });

    try {
      if (syncMethod === 'google') {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setSyncProgress(prev => ({
            ...prev,
            current: Math.min(prev.current + Math.ceil(contacts.length / 10), contacts.length),
          }));
        }, 500);

        const endpoint = operation === 'add' ? '/api/sync/google' : '/api/sync/delete';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts }),
        });

        clearInterval(progressInterval);
        setSyncProgress({ current: contacts.length, total: contacts.length });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || `${operation === 'add' ? 'Sync' : 'Delete'} failed`);
          setStep('method');
          setSyncing(false);
          return;
        }

        setSyncResults({
          ...data,
          addedCount: data.addedCount || data.deletedCount,
          skippedCount: data.skippedCount
        });
        setStep('results');
        toast.success(`${data.addedCount || data.deletedCount} contacts ${operation === 'add' ? 'synced' : 'deleted'}!`);
        refreshUser();
      } else {
        // iPhone VCF download
        const res = await fetch('/api/sync/vcf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'VCF generation failed');
          setStep('method');
          setSyncing(false);
          return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts_${Date.now()}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setSyncResults({
          addedCount: contacts.length,
          skippedCount: 0,
          added: contacts,
          skipped: [],
          creditsRemaining: Math.max(0, (user.credits || 0) - 1),
        });
        setSyncProgress({ current: contacts.length, total: contacts.length });
        setStep('results');
        toast.success('VCF file downloaded!');
        refreshUser();
      }
    } catch (error) {
      toast.error('Sync failed. Please try again.');
      setStep('method');
    } finally {
      setSyncing(false);
    }
  };

  const removeContact = (index) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const downloadSkipped = () => {
    if (!syncResults?.skipped?.length) return;
    const csv = 'Name,Phone,Reason\n' + syncResults.skipped.map(c => `"${c.name}","${c.phone}","${c.reason || ''}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skipped_contacts.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetFlow = () => {
    setStep('upload');
    setContacts([]);
    setParseErrors([]);
    setFilename('');
    setSyncResults(null);
    setSyncProgress({ current: 0, total: 0 });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-12 max-w-5xl mx-auto px-4">
          <SkeletonDashboard />
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
          {/* Header */}
          <div className="mb-8 fade-in-up">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-500 text-sm">Upload contacts and sync them to your phone</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 fade-in-up-delayed">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Credits</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {user.freeUsed ? user.credits : '1 Free'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Plan</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1 capitalize">{user.plan}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Preference</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1 capitalize">{user.syncPreference || 'Google'}</p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {['Upload', 'Preview', 'Method', 'Sync', 'Results'].map((s, i) => {
              const steps = ['upload', 'preview', 'method', 'syncing', 'results'];
              const stepIndex = steps.indexOf(step);
              const isActive = i === stepIndex;
              const isPast = i < stepIndex;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : isPast ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                    {s}
                  </div>
                  {i < 4 && <div className={`w-8 h-0.5 ${isPast ? 'bg-primary-300' : 'bg-slate-200'} hidden sm:block`} />}
                </div>
              );
            })}
          </div>

          {/* Operation Toggle */}
          {step === 'upload' && (
            <div className="flex justify-center mb-6 fade-in-up">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                <button
                  onClick={() => setOperation('add')}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    operation === 'add' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  Add Contacts
                </button>
                <button
                  onClick={() => setOperation('delete')}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    operation === 'delete' 
                      ? 'bg-white text-danger shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Trash2 className="w-4 h-4 inline mr-1.5" />
                  Bulk Delete
                </button>
              </div>
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="fade-in-up">
              <div
                {...getRootProps()}
                className={`bg-white rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? (operation === 'add' ? 'border-primary-400 bg-primary-50/50' : 'border-danger bg-red-50/50')
                    : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  operation === 'add' ? 'bg-primary-50' : 'bg-red-50'
                }`}>
                  {uploading ? (
                    <RefreshCw className={`w-8 h-8 animate-spin ${operation === 'add' ? 'text-primary-600' : 'text-danger'}`} />
                  ) : operation === 'add' ? (
                    <Upload className="w-8 h-8 text-primary-600" />
                  ) : (
                    <Trash2 className="w-8 h-8 text-danger" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {uploading ? 'Processing...' : isDragActive ? 'Drop your file here' : (operation === 'add' ? 'Upload Contacts to Add' : 'Upload Contacts to Delete')}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Drag & drop your Excel or CSV file with the contacts you {operation === 'add' ? 'want to add' : 'want to remove'}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Supports .xlsx, .xls, .csv</span>
                </div>
              </div>

              {/* Template Download Button */}
              <div className="mt-4 flex justify-center fade-in-up-delayed">
                <a
                  href="/api/template"
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-100 hover:text-primary-600 transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Sample Template (.xlsx)
                </a>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="fade-in-up space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary-600" />
                      {filename}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{contacts.length} contacts found</p>
                  </div>
                  <button
                    onClick={resetFlow}
                    className="text-sm text-slate-400 hover:text-danger transition-colors"
                  >
                    Upload different file
                  </button>
                </div>

                {parseErrors.length > 0 && (
                  <div className="m-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      {parseErrors.length} warnings
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {parseErrors.map((err, i) => (
                        <p key={`${err}-${i}`} className="text-xs text-amber-700">{err}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact list - responsive */}
                <div className="max-h-[400px] overflow-y-auto">
                  {/* Desktop table */}
                  <table className="w-full hidden sm:table">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">#</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Phone</th>
                        <th className="text-right text-xs font-medium text-slate-400 uppercase px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact, i) => (
                        <tr key={`${contact.phone}-${i}`} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 text-sm text-slate-400">{i + 1}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                                {contact.name[0]?.toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{contact.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-500 font-mono">{contact.phone}</td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => removeContact(i)} className="p-1.5 text-slate-300 hover:text-danger hover:bg-red-50 rounded-lg transition-all">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-2 p-4">
                    {contacts.map((contact, i) => (
                      <div key={`${contact.phone}-${i}`} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                            {contact.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{contact.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{contact.phone}</p>
                          </div>
                        </div>
                        <button onClick={() => removeContact(i)} className="p-1.5 text-slate-300 hover:text-danger">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {contacts.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep('method')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all text-sm"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Method Selection Step */}
          {step === 'method' && (
            <div className="fade-in-up space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSyncMethod('google')}
                  className={`bg-white rounded-2xl p-6 border-2 text-left transition-all ${
                    syncMethod === 'google' ? 'border-primary-500 shadow-lg shadow-primary-600/10 ring-2 ring-primary-100' : 'border-slate-200 hover:border-primary-200'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Monitor className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">Google Contacts Sync</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Automatically add contacts directly to your Google account.</p>
                    <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-800 leading-relaxed mb-1">
                        ✨ <strong className="font-semibold">Pro-tip for iPhone:</strong> Enable Google Contacts sync in your iOS settings for an instant, magic experience without downloading any files!
                      </p>
                      <p className="text-[10px] text-blue-600 font-medium">
                        (How? Go to Settings ➔ Contacts ➔ Accounts ➔ Gmail, and toggle Contacts ON)
                      </p>
                    </div>
                  </div>
                  {syncMethod === 'google' && (
                    <div className="mt-3 flex items-center gap-1.5 text-primary-600 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" /> Selected
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setSyncMethod('iphone')}
                  disabled={operation === 'delete'}
                  className={`bg-white rounded-2xl p-6 border-2 text-left transition-all ${
                    syncMethod === 'iphone' ? 'border-primary-500 shadow-lg shadow-primary-600/10 ring-2 ring-primary-100' : 'border-slate-200 hover:border-primary-200'
                  } ${operation === 'delete' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                    <Smartphone className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">iPhone Import (VCF)</h3>
                  <p className="text-sm text-slate-500">
                    {operation === 'delete' ? 'VCF delete is not supported. Use Google Sync to delete.' : 'Download a .vcf file and import it on your iPhone. Works with all iOS devices.'}
                  </p>
                  {syncMethod === 'iphone' && operation === 'add' && (
                    <div className="mt-3 flex items-center gap-1.5 text-primary-600 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" /> Selected
                    </div>
                  )}
                </button>
              </div>

              {/* Credit warning */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>This will use 1 credit.</strong>{' '}
                  {!user.freeUsed ? 'You have 1 free sync remaining.' : `You have ${user.credits} credits remaining.`}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep('preview')} className="text-sm text-slate-500 hover:text-primary-600 font-medium">
                  ← Back to preview
                </button>
                <button
                  onClick={() => {
                    if (operation === 'delete') {
                      setShowConfirmDelete(true);
                    } else {
                      handleSync();
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all text-sm ${
                    operation === 'add' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 shadow-primary-600/25 hover:shadow-primary-600/40' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 shadow-red-600/25 hover:shadow-red-600/40'
                  }`}
                >
                  {operation === 'add' ? <Zap className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  {operation === 'add' ? 'Sync Now' : 'Delete Now'} ({contacts.length} contacts)
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-danger" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Confirm Delete</h3>
                <p className="text-slate-500 text-center text-sm mb-6 leading-relaxed">
                  Are you sure you want to delete these <span className="font-bold text-slate-900">{contacts.length} contacts</span>? This action cannot be undone.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmDelete(false);
                      handleSync();
                    }}
                    className="w-full py-3 bg-danger text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="w-full py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Syncing Step */}
          {step === 'syncing' && (
            <div className="fade-in-up">
              <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Syncing Contacts...</h3>
                <p className="text-slate-500 text-sm mb-8">
                  {syncMethod === 'google' ? 'Adding contacts to your Google account' : 'Generating VCF file'}
                </p>

                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-primary-600">
                      {syncProgress.current}/{syncProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="progress-bar h-full rounded-full"
                      style={{ width: `${syncProgress.total ? (syncProgress.current / syncProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Your contacts are being synced securely
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Step */}
          {step === 'results' && syncResults && (
            <div className="fade-in-up space-y-4">
              {/* Summary */}
              <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  operation === 'add' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {operation === 'add' ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <Trash2 className="w-8 h-8 text-danger" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {operation === 'add' ? 'Sync Complete!' : 'Deletion Complete!'}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Your contacts have been processed successfully
                </p>

                <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                  <div className={`${operation === 'add' ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-4`}>
                    <p className={`text-2xl font-bold ${operation === 'add' ? 'text-green-700' : 'text-danger'}`}>{syncResults.addedCount}</p>
                    <p className={`text-xs font-medium ${operation === 'add' ? 'text-green-600' : 'text-danger'}`}>{operation === 'add' ? 'Added' : 'Deleted'}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-amber-700">{syncResults.skippedCount}</p>
                    <p className="text-xs text-amber-600 font-medium">Skipped</p>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-primary-700">{syncResults.creditsRemaining}</p>
                    <p className="text-xs text-primary-600 font-medium">Credits Left</p>
                  </div>
                </div>
              </div>

              {/* Skipped contacts */}
              {syncResults.skipped?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Skipped Contacts ({syncResults.skipped.length})
                    </h3>
                    <button
                      onClick={downloadSkipped}
                      className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download CSV
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {syncResults.skipped.map((c, i) => (
                      <div key={`${c.phone}-${i}`} className="flex items-center justify-between px-5 py-3 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">
                            {c.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{c.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{c.phone}</p>
                          </div>
                        </div>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{c.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={resetFlow}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/25 transition-all text-sm"
                >
                  {operation === 'add' ? <Upload className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  {operation === 'add' ? 'Sync More Contacts' : 'Back to Upload'}
                </button>
                <button
                  onClick={() => router.push('/credits')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-primary-300 transition-all text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Credits
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
