'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/header';
import { Footer } from '../../components/layout/footer';
import { useAuth } from '../../lib/context/auth-context';
import { 
  Package, 
  Heart, 
  CreditCard, 
  Gift, 
  HelpCircle, 
  ShieldCheck, 
  MapPin, 
  Plus, 
  ChevronRight, 
  Edit3, 
  ShoppingBag, 
  Trash2, 
  Calendar, 
  Clock, 
  X, 
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import { updateUserProfileApi, requestPhoneUpdateApi, verifyPhoneUpdateApi } from '../../lib/services/auth-service';

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export default function UserProfilePage() {
  const { user, isAuthenticated, loading, openLoginModal, setSessionUser } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Edit Profile State
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(
    user?.phone && !user.phone.startsWith('google_') ? user.phone : ''
  );

  // Phone Update OTP State
  const [isPhoneUpdateOtpOpen, setIsPhoneUpdateOtpOpen] = useState(false);
  const [phoneUpdateOtp, setPhoneUpdateOtp] = useState('');
  const [phoneUpdateVerificationId, setPhoneUpdateVerificationId] = useState('');
  const [isPhoneUpdating, setIsPhoneUpdating] = useState(false);
  const [phoneUpdateError, setPhoneUpdateError] = useState('');
  const [editProfileError, setEditProfileError] = useState('');

  // Keep state synced when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone && !user.phone.startsWith('google_') ? user.phone : '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Update name if changed
      if (editName.trim() !== user.name) {
        const updatedUser = await updateUserProfileApi({
          name: editName.trim() || user.name,
        });
        if (setSessionUser) {
          setSessionUser(updatedUser);
        }
      }

      // Check if phone changed
      const originalPhone = user.phone && !user.phone.startsWith('google_') ? user.phone : '';
      if (editPhone.trim() !== originalPhone && editPhone.trim() !== '') {
        setIsPhoneUpdating(true);
        setEditProfileError('');
        try {
          const res = await requestPhoneUpdateApi(editPhone.trim());
          if (res.verificationId) {
            setPhoneUpdateVerificationId(res.verificationId);
            setIsPhoneUpdateOtpOpen(true);
          } else {
             setEditProfileError('Failed to send OTP. Please try again.');
          }
        } catch (err: any) {
          console.warn('Phone update request error:', err.message);
          setEditProfileError(err.message || 'Failed to send OTP');
        } finally {
          setIsPhoneUpdating(false);
        }
      } else {
        setIsEditProfileOpen(false);
      }
    } catch (err: any) {
      console.error('[PROFILE DB UPDATE ERROR]', err);
      // Fallback local update if offline
      const fallbackUser = {
        ...user,
        name: editName.trim() || user.name,
      };
      if (setSessionUser) {
        setSessionUser(fallbackUser);
      }
      setIsEditProfileOpen(false);
    }
  };

  const handleVerifyPhoneUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneUpdateError('');
    setIsPhoneUpdating(true);
    try {
      const updatedUser = await verifyPhoneUpdateApi(phoneUpdateOtp, phoneUpdateVerificationId);
      if (setSessionUser) {
        setSessionUser(updatedUser);
      }
      setIsPhoneUpdateOtpOpen(false);
      setIsEditProfileOpen(false);
      setPhoneUpdateOtp('');
      alert('Phone number updated successfully!');
    } catch (err: any) {
      console.warn('Phone update verify error:', err.message);
      setPhoneUpdateError(err.message || 'Invalid OTP');
    } finally {
      setIsPhoneUpdating(false);
    }
  };

  // Address Form State
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  });

  const userAddrStorageKey = `ledamas_user_addresses_${user?.id || (user?.phone ? user.phone.replace(/\D/g, '') : null) || user?.email || 'guest'}`;

  // Load Saved Addresses from localStorage for current user
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userAddrStorageKey);
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else {
        setAddresses([]);
      }
    } catch (e) {
      console.error('Failed to load addresses', e);
      setAddresses([]);
    }
  }, [userAddrStorageKey]);

  // Sync addresses to localStorage
  const saveAddressesToStorage = (updated: SavedAddress[]) => {
    setAddresses(updated);
    try {
      localStorage.setItem(userAddrStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist address', e);
    }
  };

  // Fetch real user orders from server database
  useEffect(() => {
    async function fetchUserOrders() {
      if (!user) {
        setLoadingOrders(false);
        return;
      }

      try {
        setLoadingOrders(true);
        const params = new URLSearchParams();
        if (user.id) params.set('userId', user.id);
        if (user.email) params.set('email', user.email);
        if (user.phone && !user.phone.startsWith('google_')) {
          params.set('phone', user.phone);
        }

        const res = await fetch(`/api/v1/orders?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setOrders(data.data);
          }
        }
      } catch (err) {
        console.error('[PROFILE] Error fetching user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    fetchUserOrders();
  }, [user]);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.phone || !newAddr.street || !newAddr.city || !newAddr.pincode) {
      alert('Please fill in all required address fields.');
      return;
    }

    const created: SavedAddress = {
      id: `addr_${Date.now()}`,
      ...newAddr,
      isDefault: addresses.length === 0,
    };

    const updated = [created, ...addresses];
    saveAddressesToStorage(updated);
    setIsAddressModalOpen(false);
    setNewAddr({ name: '', phone: '', street: '', apartment: '', city: '', state: '', pincode: '' });
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddressesToStorage(updated);
  };

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  const memberSinceFormatted = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Sep 22, 2026';

  const lastLoginFormatted = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between font-sans">
        <Header />
        <main className="pt-[calc(var(--header-height)+16px)] md:pt-[calc(var(--header-height-md)+20px)] lg:pt-[calc(var(--header-height-lg)+20px)] pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-20 max-w-xl mx-auto px-4 text-center flex-1 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-10 border border-stone-200 shadow-xl space-y-4 text-stone-900">
            <div className="w-10 h-10 border-4 border-[#CB9700] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-700">Validating your connoisseur session...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans">
        <Header />

        <main className="pt-[calc(var(--header-height)+16px)] md:pt-[calc(var(--header-height-md)+20px)] lg:pt-[calc(var(--header-height-lg)+20px)] pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Main Sign In Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-300 shadow-2xl text-center space-y-8 relative overflow-hidden">
            <div className="w-20 h-20 bg-[#CB9700]/15 text-[#CB9700] rounded-full flex items-center justify-center mx-auto border-2 border-[#CB9700]/40 shadow-inner">
              <UserIcon className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-3 max-w-lg mx-auto">
              <span className="text-xs font-sans tracking-[0.25em] text-[#B8860B] font-bold uppercase block">
                LE DAMAS CHOCOLATE CLUB
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                Sign In to View Profile
              </h1>
              <p className="text-sm text-stone-800 font-semibold leading-relaxed">
                Access your order history, saved delivery addresses, reward points, and exclusive VIP offers.
              </p>
            </div>

            <div className="pt-2 max-w-sm mx-auto">
              <button
                onClick={openLoginModal}
                className="w-full py-4 rounded-2xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white font-extrabold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>LOGIN / SIGN UP</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-stone-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0" />
              <span>Secured with 256-bit SSL encryption &amp; instant 4-digit OTP.</span>
            </div>
          </div>

          {/* Clean Light Member Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-300 rounded-2xl p-5 space-y-2 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
                <Package className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-900">My Orders</h3>
              <p className="text-xs text-stone-700 font-medium">Track shipments &amp; view past invoices</p>
            </div>

            <div className="bg-white border border-stone-300 rounded-2xl p-5 space-y-2 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl bg-rose-100/70 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
                <Heart className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-900">Wishlist</h3>
              <p className="text-xs text-stone-700 font-medium">Saved Dubai chocolates &amp; cremes</p>
            </div>

            <div className="bg-white border border-stone-300 rounded-2xl p-5 space-y-2 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                <MapPin className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-900">Saved Addresses</h3>
              <p className="text-xs text-stone-700 font-medium">One-tap express checkout</p>
            </div>

            <div className="bg-white border border-stone-300 rounded-2xl p-5 space-y-2 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-100/70 text-purple-800 flex items-center justify-center mx-auto border border-purple-200">
                <Gift className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-900">VIP Rewards</h3>
              <p className="text-xs text-stone-700 font-medium">Points &amp; exclusive member perks</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between font-sans">
      <Header />

      <main className="pt-[calc(var(--header-height)+16px)] md:pt-[calc(var(--header-height-md)+20px)] lg:pt-[calc(var(--header-height-lg)+20px)] pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-20 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 md:space-y-8">
        {/* CarbonSmith Luxury Hero Banner */}
        <section className="relative rounded-2xl md:rounded-3xl bg-gradient-to-r from-[#50311D] via-[#854E29] to-[#D9822B] shadow-2xl p-4 md:p-10 text-white overflow-hidden">
          {/* Subtle Background Pattern Decorative overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: User Avatar & Info */}
            <div className="flex items-center space-x-5 sm:space-x-6">
              {/* Avatar Circle with Edit Badge */}
              <div className="relative">
                <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-white text-[#50311D] font-serif font-bold text-xl md:text-4xl flex items-center justify-center shadow-2xl border-4 border-white/20">
                  {userInitial}
                </div>
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  title="Edit Profile & Avatar" 
                  className="absolute bottom-0 right-0 w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#1F1B18] text-[#CB9700] border border-white/40 flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                >
                  <Edit3 className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                </button>
              </div>

              {/* User Name & Details */}
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg md:text-3xl font-serif font-bold tracking-tight text-white">
                    {user?.name && !user.name.startsWith('Customer +') && !user.name.startsWith('Guest User')
                      ? user.name
                      : 'Luxury Connoisseur'}
                  </h1>
                  <button 
                    onClick={() => setIsEditProfileOpen(true)}
                    title="Edit Name" 
                    className="text-white/70 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="inline-flex items-center space-x-2 bg-black/25 backdrop-blur-md border border-white/20 px-2.5 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium text-stone-100 max-w-[180px] sm:max-w-xs overflow-hidden">
                  <span className="truncate">
                    {user?.phone && !user.phone.startsWith('google_')
                      ? `+91 ${user.phone.replace(/\D/g, '').slice(-10)}`
                      : user?.email || 'Logged In'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: User Quick Stat Counter Tiles */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 bg-black/20 backdrop-blur-md border border-white/15 py-2 px-2 md:p-4 mt-3 md:mt-0 rounded-2xl md:min-w-[320px] text-center">
              <div>
                <div className="text-base md:text-2xl font-bold font-serif text-white">0</div>
                <div className="text-[10px] md:text-[11px] font-medium text-stone-300 uppercase tracking-wider mt-0.5">Reviews</div>
              </div>
              <div className="border-x border-white/15 px-2">
                <div className="text-base md:text-2xl font-bold font-serif text-[#FFE082]">
                  {loadingOrders ? '...' : orders.length}
                </div>
                <div className="text-[10px] md:text-[11px] font-medium text-stone-300 uppercase tracking-wider mt-0.5">Orders</div>
              </div>
              <div>
                <div className="text-base md:text-2xl font-bold font-serif text-white">₹0</div>
                <div className="text-[10px] md:text-[11px] font-medium text-stone-300 uppercase tracking-wider mt-0.5">Credits</div>
              </div>
            </div>
          </div>
        </section>

        {/* CarbonSmith 2-Column Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (4 cols): Quick Links Sidebar & Account Security */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Links Block */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-[#CB9700]" />
                <span>Quick Links</span>
              </h3>

              <nav className="space-y-1.5">
                <Link
                  href="/profile/orders"
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-stone-50 transition-colors group border border-transparent hover:border-stone-200"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 group-hover:text-[#CB9700] transition-colors">
                        My Orders
                      </div>
                      <div className="text-xs text-stone-500">View & track orders</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-stone-50 transition-colors group border border-transparent hover:border-stone-200"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 group-hover:text-[#CB9700] transition-colors">
                        Wishlist
                      </div>
                      <div className="text-xs text-stone-500">Saved confections</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer group border border-transparent hover:border-stone-200">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 group-hover:text-[#CB9700] transition-colors">
                        Payments
                      </div>
                      <div className="text-xs text-stone-500">Cards & UPI options</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer group border border-transparent hover:border-stone-200">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 group-hover:text-[#CB9700] transition-colors">
                        Rewards
                      </div>
                      <div className="text-xs text-stone-500">Points & VIP perks</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <Link
                  href="/contact"
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-stone-50 transition-colors group border border-transparent hover:border-stone-200"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 group-hover:text-[#CB9700] transition-colors">
                        Help Center
                      </div>
                      <div className="text-xs text-stone-500">FAQs & support</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </nav>
            </div>

            {/* Account Security Block */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Security</span>
              </h3>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
                Your account is secured with SSL encryption and regular security audits.
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    Member Since
                  </span>
                  <span className="font-semibold text-stone-800">{memberSinceFormatted}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    Last Login
                  </span>
                  <span className="font-semibold text-stone-800">{lastLoginFormatted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Recent Orders, Saved Addresses, Account Summary */}
          <div className="lg:col-span-8 space-y-6">
            {/* Recent Orders Box */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="text-base font-bold font-serif text-stone-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-[#CB9700]" />
                  <span>Recent Orders</span>
                </h3>
                <Link
                  href="/profile/orders"
                  className="text-xs font-semibold text-[#CB9700] hover:underline uppercase tracking-wider"
                >
                  View All &rarr;
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-stone-400 text-sm">
                  Loading recent orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-stone-800">No orders yet</h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Add your favorite artisanal confections for faster checkout
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="inline-flex items-center px-6 py-2.5 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white text-xs font-semibold transition-all shadow-md"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 2).map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl border border-stone-200 hover:border-[#CB9700]/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-50/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-stone-900">{order.orderNumber}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                            {order.orderStatus || 'CONFIRMED'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {' '} &bull; {order.items?.length || 1} Items
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 w-full sm:w-auto justify-between">
                        <span className="font-serif font-bold text-stone-900 text-base">
                          ₹{Number(order.total || order.subtotal || 0).toLocaleString('en-IN')}
                        </span>
                        <Link
                          href="/profile/orders"
                          className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:border-stone-900 text-stone-800 text-xs font-semibold transition-all"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Addresses Box */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="text-base font-bold font-serif text-stone-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#CB9700]" />
                  <span>Saved Addresses</span>
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <MapPin className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-stone-800">No addresses saved</h4>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Add your delivery addresses for faster checkout experience
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="inline-flex items-center space-x-1 px-5 py-2.5 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white text-xs font-semibold transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-900 text-sm">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {addr.street} {addr.apartment ? `, ${addr.apartment}` : ''}<br />
                        {addr.city}, {addr.state} - {addr.pincode}<br />
                        Phone: +91 {addr.phone}
                      </p>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-stone-400 hover:text-rose-600 text-xs flex items-center gap-1 transition-colors pt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Summary Box */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-7 space-y-6">
              <h3 className="text-base font-bold font-serif text-stone-900 border-b border-stone-100 pb-4">
                Account Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">₹0</div>
                  <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-1">
                    Wallet Balance
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">0</div>
                  <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-1">
                    Coupons
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">₹0</div>
                  <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-1">
                    Reward Points
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="text-lg sm:text-xl font-bold font-serif text-stone-900">0</div>
                  <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-1">
                    Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#CB9700]" />
                <span>Add Delivery Address</span>
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#CB9700]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#CB9700]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House/Flat No, Street name"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#CB9700]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#CB9700]"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400001"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#CB9700]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white font-semibold transition-all shadow-md mt-2"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && !isPhoneUpdateOtpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#CB9700]" />
                <span>Edit Profile Info</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditProfileOpen(false);
                  setEditProfileError('');
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editProfileError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editProfileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#CB9700] text-sm text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#CB9700] text-sm text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-500 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'N/A'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-sm font-medium cursor-not-allowed"
                />
                <p className="text-[10px] text-stone-400 mt-1">Email is linked to your login account and cannot be changed.</p>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProfileOpen(false);
                    setEditProfileError('');
                  }}
                  className="w-1/2 py-3 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPhoneUpdating}
                  className="w-1/2 py-3 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white font-semibold transition-all shadow-md disabled:opacity-50"
                >
                  {isPhoneUpdating ? 'Sending OTP...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Update OTP Modal */}
      {isPhoneUpdateOtpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-amber-100 text-[#CB9700] rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Verify New Phone Number
              </h3>
              <p className="text-sm text-stone-600 max-w-xs mx-auto">
                We've sent a secure 4-digit verification code to <span className="font-bold text-stone-900">{editPhone}</span>
              </p>
            </div>

            {phoneUpdateError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{phoneUpdateError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPhoneUpdate} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                required
                placeholder="Enter 4-digit OTP"
                value={phoneUpdateOtp}
                onChange={(e) => setPhoneUpdateOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] text-2xl px-4 py-4 rounded-xl border-2 border-stone-300 focus:outline-none focus:border-[#CB9700] bg-stone-50 font-mono font-bold"
              />

              <button
                type="submit"
                disabled={isPhoneUpdating || phoneUpdateOtp.length !== 4}
                className="w-full py-3.5 rounded-xl bg-[#2C2927] hover:bg-[#CB9700] hover:text-black text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPhoneUpdating ? 'Verifying...' : 'Verify & Update'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPhoneUpdateOtpOpen(false);
                  setPhoneUpdateOtp('');
                  setPhoneUpdateError('');
                }}
                className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
