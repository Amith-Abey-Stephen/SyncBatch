'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const SESSION_TIMEOUT = (parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 1800) * 1000;
const STORAGE_KEY = 'syncbatch_last_activity';

export default function SessionTimeout() {
  const { user, logout } = useAuth();
  const timeoutRef = useRef(null);
  const checkIntervalRef = useRef(null);

  const handleLogout = useCallback(async () => {
    // Only logout if the user is actually logged in
    if (!user) return;

    toast('Session expired due to inactivity', {
      icon: '⏳',
      duration: 5000,
      id: 'session-timeout-toast', // Prevent duplicate toasts
    });
    
    await logout();
  }, [user, logout]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
      if (Date.now() - lastActivity >= SESSION_TIMEOUT) {
        handleLogout();
      }
    }, SESSION_TIMEOUT);
  }, [handleLogout]);

  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    // Listen for activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimer();
    
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Sync across tabs: listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const lastActivity = parseInt(e.newValue || '0');
        const elapsed = Date.now() - lastActivity;
        const remaining = SESSION_TIMEOUT - elapsed;
        
        if (remaining <= 0) {
          handleLogout();
        } else {
          timeoutRef.current = setTimeout(() => {
            handleLogout();
          }, remaining);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Periodic check in case tab is throttled or storage event missed
    checkIntervalRef.current = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
      if (Date.now() - lastActivity >= SESSION_TIMEOUT) {
        handleLogout();
      }
    }, 10000); // Check every 10 seconds

    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      window.removeEventListener('storage', handleStorageChange);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [user, resetTimer, handleLogout]);

  return null;
}
