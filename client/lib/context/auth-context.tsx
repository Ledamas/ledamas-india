'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, getAuthToken, removeAuthToken, getCurrentUserApi, logoutApi } from '../services/auth-service';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setSessionUser: (user: UserSession | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Initialize session state on mount
  useEffect(() => {
    async function initAuth() {
      // 1. Load initial user state synchronously from localStorage if available
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('ledamas_user') : null;
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      }

      // 2. Validate/refresh session with backend server
      try {
        const apiUser = await getCurrentUserApi();
        if (apiUser) {
          setUser(apiUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('ledamas_user', JSON.stringify(apiUser));
          }
        } else {
          // If server explicitly returned null (unauthenticated 401), reset local state
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('ledamas_user');
          }
        }
      } catch (e) {
        // Keep cached storedUser if offline or temporary network issue
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const setSessionUser = (userData: UserSession | null) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem('ledamas_user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('ledamas_user');
      }
    }
  };

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
    } finally {
      setSessionUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        setSessionUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
