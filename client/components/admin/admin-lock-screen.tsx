'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, Eye, EyeOff, KeyRound, AlertTriangle, ArrowRight, User, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface AdminLockScreenProps {
  onUnlock: () => void;
}

const REQUIRED_ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID || 'akkui@leamas.umm';
const REQUIRED_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Genicia@global!@#$';

export function AdminLockScreen({ onUnlock }: AdminLockScreenProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [rememberMe, setRememberMe] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check persistent security lockout state on mount
  useEffect(() => {
    try {
      const lockoutUntilStr = localStorage.getItem('ledamas_admin_lockout_until');
      if (lockoutUntilStr) {
        const lockoutUntil = parseInt(lockoutUntilStr, 10);
        const now = Date.now();
        if (lockoutUntil > now) {
          const remainingSecs = Math.ceil((lockoutUntil - now) / 1000);
          setIsLockedOut(true);
          setLockoutTime(remainingSecs);
          setError('Security Lockout Active: Too many failed admin login attempts.');
        } else {
          localStorage.removeItem('ledamas_admin_lockout_until');
        }
      }
    } catch (e) {}
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLockedOut && lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setAttempts(0);
            localStorage.removeItem('ledamas_admin_lockout_until');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut || isVerifying) return;

    const trimmedId = adminId.trim();
    const trimmedPass = password.trim();

    if (!trimmedId) {
      setError('Please enter your Admin ID / Email.');
      return;
    }
    if (!trimmedPass) {
      setError('Please enter your Admin Password.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // 1. Call Rate-Limited Server Endpoint
      const responseData: any = await fetchApi('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ adminId: trimmedId, password: trimmedPass }),
      });

      if (responseData?.token || responseData?.success) {
        const token = responseData.token || `admin_auth_${Date.now()}`;
        
        if (rememberMe) {
          localStorage.setItem('ledamas_admin_session', token);
          localStorage.setItem('ledamas_admin_id', trimmedId);
          localStorage.setItem('ledamas_admin_auth_time', Date.now().toString());
        } else {
          sessionStorage.setItem('ledamas_admin_session', token);
          sessionStorage.setItem('ledamas_admin_id', trimmedId);
        }

        localStorage.removeItem('ledamas_admin_lockout_until');
        onUnlock();
        return;
      }
    } catch (err: any) {
      const errMsg = err?.message || '';

      // Check for Rate Limit 429 response from Express backend
      if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('blocked') || errMsg.toLowerCase().includes('too many')) {
        const lockDuration = 900; // 15 minutes lockout
        const until = Date.now() + lockDuration * 1000;
        localStorage.setItem('ledamas_admin_lockout_until', until.toString());
        setIsLockedOut(true);
        setLockoutTime(lockDuration);
        setError('Security Lockout: 5 failed attempts exceeded. IP blocked for 15 minutes.');
        setIsVerifying(false);
        return;
      }

      // Fallback local check if backend API offline
      const isIdValid = trimmedId.toLowerCase() === REQUIRED_ADMIN_ID.toLowerCase();
      const isPassValid = trimmedPass === REQUIRED_ADMIN_PASSWORD;

      if (isIdValid && isPassValid) {
        const token = `admin_auth_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        if (rememberMe) {
          localStorage.setItem('ledamas_admin_session', token);
          localStorage.setItem('ledamas_admin_id', trimmedId);
        } else {
          sessionStorage.setItem('ledamas_admin_session', token);
        }
        onUnlock();
        return;
      }
    } finally {
      setIsVerifying(false);
    }

    // Handle Failed Attempt Counter & Lockout
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setPassword('');

    if (nextAttempts >= 3) {
      const lockDuration = 60; // 60 seconds local lockout
      const until = Date.now() + lockDuration * 1000;
      localStorage.setItem('ledamas_admin_lockout_until', until.toString());
      setIsLockedOut(true);
      setLockoutTime(lockDuration);
      setError('Security Lockout: 3 invalid attempts. Login paused for 60 seconds.');
    } else {
      setError(`Invalid Admin ID or Password credentials. (${3 - nextAttempts} attempt(s) remaining)`);
    }
  };

  const formatLockoutTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#0E0C0B] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-[#CB9700] selection:text-black">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CB9700]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#2AD2C5]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Lock Screen Card */}
      <div className="relative z-10 w-full max-w-md bg-[#161312] border border-[#CB9700]/35 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="relative h-16 w-48 mx-auto">
            <Image
              src="/Le-Damas-Sweets-Logo-enhanced.png"
              alt="Le Damas Sweets Logo"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#CB9700]/15 border border-[#CB9700]/30 text-[#CB9700] text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Rate-Limited Admin Security Gate</span>
          </div>

          <p className="text-xs text-stone-400 font-light max-w-xs mx-auto">
            Authorized administrator credentials required to manage inventory, customer orders, and store settings.
          </p>
        </div>

        {/* Lock Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin ID / Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block flex items-center justify-between">
              <span>Admin ID / Email</span>
              <User className="w-3.5 h-3.5 text-[#CB9700]" />
            </label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => {
                setAdminId(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLockedOut || isVerifying}
              placeholder="e.g. akkui@leamas.umm"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-all disabled:opacity-50"
              autoFocus
            />
          </div>

          {/* Admin Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block flex items-center justify-between">
              <span>Admin Master Password</span>
              <KeyRound className="w-3.5 h-3.5 text-[#CB9700]" />
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLockedOut || isVerifying}
                placeholder="Enter password..."
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#CB9700] focus:ring-1 focus:ring-[#CB9700] transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-[#CB9700]" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Session Checkbox */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/10 text-[#CB9700] focus:ring-[#CB9700] accent-[#CB9700]"
              />
              <span>Keep admin logged in</span>
            </label>
            <span className="text-[11px] text-stone-500 font-mono">IP Rate-Limited</span>
          </div>

          {/* Error / Alert Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Unlock Button */}
          <button
            type="submit"
            disabled={isLockedOut || isVerifying}
            className="w-full py-3.5 px-4 rounded-xl bg-[#CB9700] hover:bg-[#e5ad0d] text-black font-semibold text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-[#CB9700]/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Verifying Credentials...</span>
              </>
            ) : isLockedOut ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Locked ({formatLockoutTimer(lockoutTime)})</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Access Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="pt-4 border-t border-white/10 text-center space-y-1">
          <p className="text-[11px] text-stone-500 font-mono">
            LE DAMAS LUXURY CHOCOLATERIE &bull; SELLER HUB V1.0
          </p>
          <p className="text-[10px] text-stone-600">
            Rate-Limited Admin Security Shield Active
          </p>
        </div>
      </div>
    </div>
  );
}
