import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthResponse, AuthRequest, RegisterRequest } from '../types';
import { mobileApi } from '../services/mobileApi';

interface MobileAuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthRequest) => Promise<AuthResponse>;
  register: (req: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export const MobileAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: AuthRequest) => {
    setIsLoading(true);
    try {
      const res = await mobileApi.login(credentials);
      setToken(res.token);
      mobileApi.setToken(res.token);
      const profile = await mobileApi.getProfile();
      setUser(profile);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (req: RegisterRequest) => {
    setIsLoading(true);
    try {
      const res = await mobileApi.register(req);
      setToken(res.token);
      mobileApi.setToken(res.token);
      const profile = await mobileApi.getProfile();
      setUser(profile);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    mobileApi.setToken(null);
  };

  return (
    <MobileAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
};

export const useMobileAuth = () => {
  const context = useContext(MobileAuthContext);
  if (!context) {
    throw new Error('useMobileAuth must be used within MobileAuthProvider');
  }
  return context;
};
