"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../lib/context/auth-context";

interface PopupSettings {
  isEnabled: boolean;
  discountPercent: number;
  couponCode: string;
  title: string;
  subtitle: string;
  description: string;
}

export default function FirstOrderPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "success">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasShown, setHasShown] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const popupDismissedKey = "ledamas_first_order_dismissed";
  const popupClaimedKey = "ledamas_first_order_claimed";

  useEffect(() => {
    // If user is logged in, don't show the popup at all
    if (isAuthenticated) {
      return;
    }

    if (hasShown) {
      return;
    }

    let timer: NodeJS.Timeout;
    
    // Fetch settings
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/auth/popup-settings`);
        const data = await res.json();
        if (data.success && data.data?.isEnabled) {
          setSettings(data.data);

          // Show after exactly 6 seconds (6000ms)
          timer = setTimeout(() => {
            if (!hasShown) {
              setIsOpen(true);
              setHasShown(true);
            }
          }, 6000);

          // Or on exit intent
          const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShown) {
              setIsOpen(true);
              setHasShown(true);
              document.removeEventListener("mouseleave", handleMouseLeave);
            }
          };
          document.addEventListener("mouseleave", handleMouseLeave);

          return () => {
            clearTimeout(timer);
            document.removeEventListener("mouseleave", handleMouseLeave);
          };
        }
      } catch (err: any) {
        console.warn("Popup settings not reachable:", err.message);
      }
    };

    fetchSettings();
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthenticated, hasShown]);

  const handleClose = () => {
    setIsOpen(false);
    // localStorage.setItem(popupDismissedKey, "true"); // Disabled per request
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/auth/popup-claim-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${cleaned}` }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
        // localStorage.setItem(popupClaimedKey, "true"); // Disabled per request
      } else {
        setError(data.message || "Failed to claim offer.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Do not render the popup on any admin pages, checkout pages, or if user is authenticated
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout') || isAuthenticated) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && settings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden bg-[#1A1A1A] rounded-2xl shadow-2xl z-10 border border-white/10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="p-8 sm:p-10 text-center">
              {step === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="text-green-500 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-light text-white mb-2 font-serif tracking-wide">
                    Offer Claimed!
                  </h3>
                  <p className="text-white/70 mb-8 font-light">
                    Your {settings.discountPercent}% discount code <span className="text-white font-medium">{settings.couponCode}</span> is ready. Use it at checkout.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full bg-white text-black py-4 rounded-full font-medium tracking-wide hover:bg-gray-100 transition-colors"
                  >
                    CONTINUE SHOPPING
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col"
                >
                  <h2 className="text-[11px] font-medium tracking-[0.2em] text-[#C19B76] mb-4 uppercase">
                    {settings.title}
                  </h2>
                  <h3 className="text-3xl sm:text-4xl font-light text-white mb-4 font-serif leading-tight">
                    {settings.subtitle}
                  </h3>
                  <p className="text-white/60 text-sm mb-8 font-light">
                    {settings.description}
                  </p>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-left">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleClaim} className="space-y-4">
                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors">
                      <div className="pl-4 pr-3 py-4 text-white/50 border-r border-white/10 font-medium">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full bg-transparent px-4 py-4 text-white placeholder-white/30 outline-none font-light"
                        maxLength={10}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || phone.replace(/\D/g, "").length !== 10}
                      className="w-full bg-[#C19B76] text-white py-4 rounded-xl font-medium tracking-wide hover:bg-[#A88562] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-14"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CLAIM NOW"}
                    </button>
                  </form>

                  <p className="mt-6 text-[10px] text-white/30 uppercase tracking-wider">
                    By submitting your number, you agree to our Terms & Privacy Policy.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
