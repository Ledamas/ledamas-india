'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, ArrowRight, ChevronDown, Check, Edit2, RotateCw, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { sendOtpApi, verifyOtpApi, resendOtpApi, googleAuthApi, UserSession } from '../../lib/services/auth-service';
import { useAuth } from '../../lib/context/auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { setSessionUser } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [countryCode, setCountryCode] = useState('+91');
  const [resendTimer, setResendTimer] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserSession | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend (15 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, resendTimer]);

  const googleInitializedRef = useRef(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isRealGoogleClientId = Boolean(
    googleClientId &&
    googleClientId.trim() !== '' &&
    !googleClientId.includes('sample')
  );

  const initGoogleSDK = () => {
    if (googleInitializedRef.current || !isRealGoogleClientId) return;
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          use_fedcm_for_prompt: false,
        });
        googleInitializedRef.current = true;
      } catch (e) {
        console.warn('[GOOGLE GSI INIT NOTICE]', e);
      }
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) return;
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const res: any = await googleAuthApi({ credential: response.credential });
      const authenticatedUser = res?.user || res;
      setLoggedInUser(authenticatedUser);
      setSessionUser(authenticatedUser);
      setStep('success');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2400);
    } catch (err: any) {
      console.error('[GOOGLE SIGN-IN ERROR]', err);
      setErrorMessage(err?.message || 'Failed to authenticate with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setErrorMessage(null);

    if (isRealGoogleClientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        initGoogleSDK();
        (window as any).google.accounts.id.prompt();
      } catch (e) {
        console.warn('[GOOGLE GSI PROMPT ERROR]', e);
        setErrorMessage('Failed to trigger Google Sign-In prompt.');
      }
    } else {
      setErrorMessage('Google Sign-In is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setLoading(true);
      setErrorMessage(null);
      try {
        await sendOtpApi(phone);
        setStep('otp');
        setResendTimer(15);
        setIsTimerActive(true);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } catch (error: any) {
        setErrorMessage(error?.message || 'Failed to send OTP code. Please check your mobile number.');
      } finally {
        setLoading(false);
      }
    }
  };

  const executeVerifyOtp = async (otpCode: string) => {
    if (otpCode.length < 4 || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res: any = await verifyOtpApi(phone, otpCode);
      const authenticatedUser = res?.user || res;
      setLoggedInUser(authenticatedUser);
      setSessionUser(authenticatedUser);
      setStep('success');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2400);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanedVal = value.replace(/\D/g, '');
    if (!cleanedVal && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanedVal.slice(-1);
    setOtp(newOtp);

    // Auto move to next input box
    if (cleanedVal && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 4 digits filled
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 4) {
      executeVerifyOtp(fullOtp);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pastedData) return;

    const digits = pastedData.split('');
    const newOtp = ['', '', '', ''];
    digits.forEach((digit, i) => {
      if (i < 4) newOtp[i] = digit;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, 3);
    otpInputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 4) {
      executeVerifyOtp(pastedData);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length >= 4) {
      executeVerifyOtp(fullOtp);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await resendOtpApi(phone);
      setOtp(['', '', '', '']);
      setResendTimer(15);
      setIsTimerActive(true);
      otpInputRefs.current[0]?.focus();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp(['', '', '', '']);
    setIsTimerActive(false);
    setLoading(false);
    setIsGoogleLoading(false);
    setErrorMessage(null);
    setLoggedInUser(null);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Official Google Identity Services Script */}
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="lazyOnload"
            onLoad={() => {
              initGoogleSDK();
            }}
          />

          {/* Dark Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Right-Side Slide-Over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-[440px] bg-[#FDFBF7] text-[#2B2825] shadow-2xl overflow-y-auto h-full flex flex-col"
          >
            {/* Top Luxury Banner Photo */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#0F0D0C] shrink-0">
              <Image
                src="/hero/banner-elegance.webp"
                alt="LE DAMAS Luxury Confections"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 440px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/20" />

              {/* Top Close Button (X) */}
              <button
                onClick={handleModalClose}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-black shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Overlay Brand Tagline */}
              <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
                <span className="text-[10px] font-sans tracking-[0.25em] text-[#B8860B] font-bold uppercase drop-shadow-sm">
                  LE DAMAS CHOCOLATERIE
                </span>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="px-6 pt-6 pb-8 sm:px-8 sm:pb-9 flex-1">
              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {step === 'phone' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  {/* Title & Subtitle */}
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2825] font-normal tracking-tight">
                      Welcome to LE DAMAS
                    </h2>
                    <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.22em] text-[#B8860B] font-semibold uppercase mt-1.5">
                      HANDCRAFTED LUXURY &bull; DELICIOUS SINCE 1951
                    </p>
                  </div>

                  {/* Phone Form */}
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-sans tracking-widest text-[#595550] uppercase font-bold mb-2">
                        MOBILE NUMBER
                      </label>

                      {/* Phone Input Box with Country Code */}
                      <div className="flex items-center border border-[#DCD6CD] rounded-md bg-[#F8F6F1] focus-within:border-[#2B2825] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#2B2825] transition-all overflow-hidden h-12 shadow-inner">
                        <div className="flex items-center space-x-1 px-3.5 text-xs text-[#2B2825] font-semibold border-r border-[#DCD6CD] shrink-0 cursor-pointer select-none h-full bg-[#FAF8F3]">
                          <span>{countryCode}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                        </div>

                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter your mobile number"
                          className="w-full px-3.5 text-sm text-[#2B2825] font-medium bg-transparent placeholder:text-stone-400 focus:outline-none h-full tracking-wider"
                        />
                      </div>

                      <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#78726A] font-sans mt-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                        <span>We'll send a secure 4-digit verification code.</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={phone.length < 10 || loading}
                      className={`w-full py-3.5 rounded-md text-xs uppercase tracking-[0.2em] font-semibold font-sans flex items-center justify-center space-x-2 transition-all duration-300 shadow-sm mt-2 ${phone.length === 10 && !loading
                        ? 'bg-[#2B2825] text-white hover:bg-[#B8860B] active:scale-[0.99] cursor-pointer'
                        : 'bg-[#8C877F] text-white/90 cursor-not-allowed'
                        }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" />
                          <span>SENDING OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>SEND OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* OR Divider */}
                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-[#EBE4D8]"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-sans tracking-widest text-[#78726A] font-bold">
                      OR CONTINUE WITH
                    </span>
                    <div className="flex-grow border-t border-[#EBE4D8]"></div>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={isGoogleLoading}
                    className="w-full py-3.5 px-4 rounded-md border border-[#DCD6CD] bg-white hover:bg-[#FAF8F3] active:scale-[0.99] text-[#2B2825] font-sans text-xs font-semibold flex items-center justify-center space-x-3 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" />
                        <span>AUTHENTICATING GOOGLE...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#78726A] font-sans mt-5 text-center leading-relaxed">
                    <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>
                      By continuing, you agree to our{' '}
                      <a href="#" className="underline text-[#595550] hover:text-[#B8860B]">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="underline text-[#595550] hover:text-[#B8860B]">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </div>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="font-serif text-2xl text-[#2B2825] font-normal tracking-tight">
                      Verify Mobile Number
                    </h2>
                    <div className="flex items-center justify-center space-x-2 mt-1.5">
                      <p className="text-xs text-[#78726A] font-sans">
                        Code sent to <span className="font-semibold text-[#2B2825]">{countryCode} {phone}</span>
                      </p>
                      <button
                        onClick={() => {
                          setStep('phone');
                          setErrorMessage(null);
                        }}
                        className="text-[11px] text-[#B8860B] hover:underline font-semibold flex items-center space-x-0.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="flex justify-center items-center space-x-3">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onPaste={handleOtpPaste}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-12 h-14 text-center text-xl font-bold text-[#2B2825] bg-[#F8F6F1] border border-[#DCD6CD] rounded-lg focus:border-[#B8860B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 transition-all shadow-inner"
                        />
                      ))}
                    </div>

                    <div className="text-center text-xs text-[#78726A]">
                      {isTimerActive ? (
                        <span>Resend OTP in <span className="font-semibold text-[#2B2825]">{resendTimer} seconds</span></span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-[#B8860B] hover:underline font-semibold inline-flex items-center space-x-1"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Resend Verification Code</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={otp.join('').length < 4 || loading}
                      className={`w-full py-3.5 rounded-md text-xs uppercase tracking-[0.2em] font-semibold font-sans flex items-center justify-center space-x-2 transition-all duration-300 shadow-sm ${otp.join('').length >= 4 && !loading
                        ? 'bg-[#2B2825] text-white hover:bg-[#B8860B] active:scale-[0.99] cursor-pointer'
                        : 'bg-[#8C877F] text-white/90 cursor-not-allowed'
                        }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" />
                          <span>VERIFYING...</span>
                        </>
                      ) : (
                        <>
                          <span>VERIFY & CONTINUE</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="py-6 text-center space-y-6"
                >
                  {/* Glowing Gold Ring Badge */}
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-[#B8860B]/20 blur-md animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#F8F3EA] to-[#EFE7D8] border-2 border-[#B8860B] shadow-xl flex items-center justify-center">
                      <Check className="w-9 h-9 text-[#B8860B] stroke-[2.5]" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans tracking-[0.25em] text-[#B8860B] font-bold uppercase block mb-1">
                      AUTHENTICATED &bull; LUXURY MEMBER
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#2B2825] font-normal tracking-tight">
                      Welcome to LE DAMAS
                    </h3>
                    <p className="text-xs text-[#78726A] mt-1 font-light max-w-xs mx-auto">
                      Your 30-day secure session has been successfully initiated.
                    </p>
                  </div>

                  {/* Connoisseur Profile Summary Box */}
                  <div className="bg-gradient-to-br from-[#FAF8F3] to-[#F3EEE3] p-4 rounded-xl border border-[#EBE3D3] shadow-inner text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans tracking-widest text-[#B8860B] font-bold uppercase">
                        MEMBER ACCOUNT
                      </span>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#B8860B]/10 text-[#B8860B] text-[10px] font-semibold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[#2B2825]">
                      {loggedInUser?.name || 'Luxury Connoisseur'}
                    </div>

                    {(loggedInUser?.email || loggedInUser?.phone || phone) && (
                      <div className="text-xs text-[#78726A] font-medium truncate">
                        {loggedInUser?.email || loggedInUser?.phone || (phone ? `+91 ${phone}` : '')}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="w-full py-3.5 rounded-md bg-[#2B2825] text-white hover:bg-[#B8860B] text-xs font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>CONTINUE SHOPPING</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
