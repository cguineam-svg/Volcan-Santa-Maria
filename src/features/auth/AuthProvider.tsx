import { changeOwnPassword } from '../../../shared/password-change';
import { createPasswordVerificationClient } from '../../lib/supabase';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isAdult, isValidPassword } from '../../../shared/account-policy';
import { supabase } from '../../lib/supabase';
import { setOfflineCacheOwner } from '../../lib/offline-cache';
import {
  AuthContext,
  type AuthContextValue,
  type SignUpCredentials,
  type SignUpResult,
} from './auth-context';
import { getAuthRedirectUrl } from './auth-redirect';

type AuthProviderProps = {
  children: ReactNode;
};

// supabase-js answers with no session when an expired token cannot be refreshed for
// lack of network, but keeps it stored. It removes it when the session is really invalid,
// so a stored session here means the person is still signed in on this device.
function readStoredSession(): Session | null {
  try {
    const projectRef = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0];
    const stored = window.localStorage.getItem(`sb-${projectRef}-auth-token`);
    const session = stored ? (JSON.parse(stored) as Session) : null;
    return session?.user ? session : null;
  } catch {
    return null;
  }
}

const SESSION_CHECK_TIMEOUT_MS = 3000;

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession: Session | null) => {
      const resolvedSession = nextSession ?? readStoredSession();
      setSession(resolvedSession);
      setUser(resolvedSession?.user ?? null);
      setOfflineCacheOwner(resolvedSession?.user.id ?? null);
    };

    // On a weak signal the refresh can hang without failing.
    const sessionCheckTimer = window.setTimeout(() => {
      const storedSession = readStoredSession();
      if (!isMounted || !storedSession) return;
      setSession((current) => current ?? storedSession);
      setUser((current) => current ?? storedSession.user);
      setLoading(false);
    }, SESSION_CHECK_TIMEOUT_MS);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setOfflineCacheOwner(null);
      } else {
        applySession(nextSession);
      }
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      } else if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
      }
      setLoading(false);
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) throw error;

        applySession(data.session);
      })
      .catch(() => {
        if (!isMounted) return;

        applySession(null);
      })
      .finally(() => {
        window.clearTimeout(sessionCheckTimer);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(sessionCheckTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async ({
      dateOfBirth,
      firstName,
      lastName,
      email,
      password,
      legalConsentAccepted,
      captchaToken,
    }: SignUpCredentials): Promise<SignUpResult> => {
      if (!isAdult(dateOfBirth)) throw new Error('adult_required');
      if (!isValidPassword(password)) throw new Error('password_policy');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            date_of_birth: dateOfBirth,
            first_name: firstName,
            last_name: lastName,
            legal_consent_accepted: legalConsentAccepted,
            terms_version: '1.0',
            privacy_version: '1.0',
          },
          emailRedirectTo: getAuthRedirectUrl(),
          captchaToken,
        },
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      return {
        requiresEmailConfirmation: data.session === null,
        email,
      };
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    setSession(data.session);
    setUser(data.user);
  }, []);

  const resendSignUpEmail = useCallback(
    async (email: string, captchaToken?: string) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          captchaToken,
        },
      });

      if (error) throw error;
    },
    []
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });

    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string, currentPassword?: string) => {
    if (currentPassword !== undefined) return changeOwnPassword(supabase, createPasswordVerificationClient, currentPassword, password);
    if (!isValidPassword(password)) throw new Error('password_policy');
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;
  }, []);

  const completePasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setSession(null);
    setUser(null);
    setIsPasswordRecovery(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isEmailVerified: Boolean(user?.email_confirmed_at),
      isPasswordRecovery,
      signUp,
      signIn,
      resendSignUpEmail,
      requestPasswordReset,
      updatePassword,
      completePasswordRecovery,
      signOut,
    }),
    [
      user,
      session,
      loading,
      isPasswordRecovery,
      signUp,
      signIn,
      resendSignUpEmail,
      requestPasswordReset,
      updatePassword,
      completePasswordRecovery,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
