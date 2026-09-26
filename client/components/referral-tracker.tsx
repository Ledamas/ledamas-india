'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && refCode.trim()) {
      const clean = refCode.trim().toUpperCase();
      try {
        localStorage.setItem('ledamas_referral_code', clean);
        console.log('[REFERRAL TRACKER] Saved referral code:', clean);
      } catch (e) {
        console.warn('[REFERRAL TRACKER] Could not store referral code:', e);
      }
    }
  }, [searchParams]);

  return null;
}
