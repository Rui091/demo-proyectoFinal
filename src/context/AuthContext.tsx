import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthState = 'unauthenticated' | 'requires_2fa' | 'authenticated';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authState: AuthState;
  login: (email: string, password: string) => Promise<{ error: any }>;
  verify2FA: (code: string) => Promise<{ error: any }>;
  enrollMFA: () => Promise<{ data: { id: string; type: string; totp: { qr_code: string; secret: string; uri: string } } | null; error: any }>;
  unenrollMFA: (factorId: string) => Promise<{ error: any }>;
  verifyEnrollment: (factorId: string, code: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [isLoading, setIsLoading] = useState(true);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkMFAStatus(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkMFAStatus(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkMFAStatus = async (session: Session | null) => {
    if (!session) {
      setAuthState('unauthenticated');
      return;
    }

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = factors?.all?.some(f => f.status === 'verified');

    if (!hasVerifiedFactor) {
      // User hasn't set up MFA yet, so they are authenticated
      setAuthState('authenticated');
      return;
    }

    // Check assurance level
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const appMetadataAal = session.user?.app_metadata?.aal;
    
    console.log('MFA Check:', { currentLevel: data?.currentLevel, appMetadataAal });

    if (data?.currentLevel === 'aal2' || appMetadataAal === 'aal2') {
      setAuthState('authenticated');
    } else {
      // User needs MFA but is at AAL1. 
      // We need to ensure a challenge exists so they can verify.
      const verifiedFactor = factors?.all?.find(f => f.status === 'verified');
      if (verifiedFactor) {
        setMfaFactorId(verifiedFactor.id);
        // Create a new challenge immediately so the user can verify
        const { data: challenge, error } = await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id });
        if (!error) {
          setMfaChallengeId(challenge.id);
        }
      }
      setAuthState('requires_2fa');
    }
  };

  const login = async (email: string, password: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
       // Mock login fallback
       const mockUser = { id: 'mock-id', email, role: 'authenticated' } as User;
       const mockSession = { user: mockUser, access_token: 'mock' } as Session;
       setUser(mockUser);
       setSession(mockSession);
       setAuthState('requires_2fa'); // Keep mock behavior for now if no Supabase
       return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    // Check if user needs MFA
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors?.all?.length) {
      const verifiedFactor = factors.all.find(f => f.status === 'verified');
      if (verifiedFactor) {
        // Start challenge
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id });
        if (challengeError) return { error: challengeError };
        
        setMfaChallengeId(challenge.id);
        setMfaFactorId(verifiedFactor.id);
        setAuthState('requires_2fa');
        return { error: null };
      }
    }

    // No MFA enabled
    setAuthState('authenticated');
    return { error: null };
  };

  const verify2FA = async (code: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        // Mock verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (code === '123456') {
          setAuthState('authenticated');
          return { error: null };
        }
        return { error: { message: 'Invalid code' } };
    }

    if (!mfaChallengeId || !mfaFactorId) return { error: { message: 'No active challenge' } };

    const { error } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: mfaChallengeId,
      code,
    });

    if (error) return { error };

    // Wait a bit for propagation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Refresh session to upgrade to AAL2
    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) return { error: refreshError };

    setSession(session);
    setUser(session?.user ?? null);
    setAuthState('authenticated');
    return { error: null };
  };

  const enrollMFA = async () => {
    return await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'TransportSys Demo',
    });
  };

  const unenrollMFA = async (factorId: string) => {
    return await supabase.auth.mfa.unenroll({ factorId });
  };

  const verifyEnrollment = async (factorId: string, code: string) => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) return { error: challengeError };

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (error) return { error };
    
    await supabase.auth.refreshSession();
    return { error: null };
  };

  const logout = async () => {
    if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
        await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setAuthState('unauthenticated');
    setMfaChallengeId(null);
    setMfaFactorId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, authState, login, verify2FA, enrollMFA, unenrollMFA, verifyEnrollment, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
