import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthResponse, AuthRequest, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoActive: boolean;
  login: (credentials: AuthRequest) => Promise<AuthResponse>;
  quickEnterDemo: (role: 'CITIZEN' | 'AUTHORITY') => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ew_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ew_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => localStorage.getItem('vulnex_demo_active') === 'true');

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await apiService.getCurrentUser();
          setUser(profile);
        } catch {
          // If in demo mode, preserve demo profile instead of logging out
          const isDemo = localStorage.getItem('vulnex_demo_active') === 'true';
          if (!isDemo) {
            logout();
          }
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const quickEnterDemo = async (role: 'CITIZEN' | 'AUTHORITY') => {
    setIsLoading(true);
    try {
      localStorage.setItem('vulnex_demo_active', 'true');
      setIsDemoActive(true);

      if (role === 'CITIZEN') {
        const demoCitizenProfile: UserProfile = {
          id: 4,
          username: 'john.citizen@example.com',
          email: 'john.citizen@example.com',
          fullName: 'John Doe (Demo Citizen)',
          role: 'ROLE_CITIZEN',
          phoneNumber: '+91-9876543210',
          accountStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        const mockToken = 'mock_jwt_token_john.citizen@example.com';
        setToken(mockToken);
        setUser(demoCitizenProfile);
        localStorage.setItem('ew_auth_token', mockToken);
        localStorage.setItem('ew_user_profile', JSON.stringify(demoCitizenProfile));

        // Silent background attempt to upgrade to real Spring Boot JWT if backend reachable
        apiService.login({ usernameOrEmail: 'john.citizen@example.com', password: 'Password@123' })
          .then((res) => {
            if (res?.token) {
              setToken(res.token);
              localStorage.setItem('ew_auth_token', res.token);
            }
          })
          .catch(() => {});
      } else {
        const demoAuthorityProfile: UserProfile = {
          id: 2,
          username: 'officer.raj@disasterresponse.gov',
          email: 'officer.raj@disasterresponse.gov',
          fullName: 'Rajesh Sharma (Disaster Commissioner)',
          role: 'ROLE_AUTHORITY',
          phoneNumber: '+91-9876543201',
          accountStatus: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        const mockToken = 'mock_jwt_token_officer.raj@disasterresponse.gov';
        setToken(mockToken);
        setUser(demoAuthorityProfile);
        localStorage.setItem('ew_auth_token', mockToken);
        localStorage.setItem('ew_user_profile', JSON.stringify(demoAuthorityProfile));

        // Silent background attempt to upgrade to real Spring Boot JWT if backend reachable
        apiService.login({ usernameOrEmail: 'officer.raj@disasterresponse.gov', password: 'Password@123' })
          .then((res) => {
            if (res?.token) {
              setToken(res.token);
              localStorage.setItem('ew_auth_token', res.token);
            }
          })
          .catch(() => {});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: AuthRequest) => {
    setIsLoading(true);
    try {
      const authRes = await apiService.login(credentials);
      setToken(authRes.token);
      localStorage.removeItem('vulnex_demo_active');
      setIsDemoActive(false);
      const profile = await apiService.getCurrentUser();
      setUser(profile);
      return authRes;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ew_auth_token');
    localStorage.removeItem('ew_user_profile');
    localStorage.removeItem('vulnex_demo_active');
    setIsDemoActive(false);
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isDemoActive,
        login,
        quickEnterDemo,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
