import { supabase } from '../../lib/supabase';
import { withOfflineCache } from '../../lib/offline-cache';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuthErrorMessage } from '../auth/auth-errors';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../../components/toast-context';
import { loadTouristProfile } from './profile-service';
import {
  isTouristProfileComplete,
  type TouristProfileData,
} from './profile-types';
import { AuthenticatedPage } from '../../pages/AuthenticatedPage';
import { ProfileFormPage } from '../../pages/ProfileFormPage';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ConsentGate } from '../legal/ConsentGate';
import { hasCurrentLegalConsent } from '../legal/legal-service';

export function ProfileGate() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user, signOut } = useAuth();
  const [staffAccount, setStaffAccount] = useState(false);
  const [profile, setProfile] = useState<TouristProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [requestNumber, setRequestNumber] = useState(0);
  const [legalConsentAccepted, setLegalConsentAccepted] = useState(false);

  useEffect(() => {
    if (!user) return;

    let active = true;

    void withOfflineCache(`profile-gate:${user.id}`, async () => {
      const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      if (error) throw error;
      if (data.role !== 'tourist') return { staff: true as const };
      const [loadedProfile, hasConsent] = await Promise.all([loadTouristProfile(user.id), hasCurrentLegalConsent()]);
      return { staff: false as const, loadedProfile, hasConsent };
    })
      .then((result) => {
        if (result.staff) { if (active) setStaffAccount(true); return; }
        const { loadedProfile, hasConsent } = result;
        if (!active) return;

        setProfile(loadedProfile);
        setLegalConsentAccepted(hasConsent);
        setLoadError(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, requestNumber]);

  if (!user || loading) {
    return (
      <>
        <LanguageSwitcher />
        <main className="auth-shell">
          <p className="loading-message" role="status">
            {t('profile.loading')}
          </p>
        </main>
      </>
    );
  }

  if (staffAccount) return <main className="auth-shell"><section className="auth-card">
    <h1>{t('final.staffAccount')}</h1><p>{t('final.staffAccountHelp')}</p>
    <button type="button" className="secondary-button" onClick={() => void signOut()}>{t('common.signOut')}</button>
  </section></main>;

  if (loadError || !profile) {
    const retry = () => {
      setLoading(true);
      setLoadError(false);
      setRequestNumber((current) => current + 1);
    };

    const handleSignOut = async () => {
      setSignOutError(null);

      try {
        await signOut();
      } catch (error) {
        setSignOutError(getAuthErrorMessage(error));
      }
    };

    return (
      <>
        <LanguageSwitcher />
        <main className="auth-shell">
          <section className="auth-card authenticated-card">
            <header className="auth-header">
              <span className="eyebrow">{t('common.brand')}</span>
              <h1>{t('profile.loadErrorTitle')}</h1>
              <p>{t('profile.loadErrorSubtitle')}</p>
            </header>

            {signOutError && (
              <p className="form-message error-message" role="alert">
                {signOutError}
              </p>
            )}

            <div className="account-actions">
              <button className="primary-button" type="button" onClick={retry}>
                {t('profile.retry')}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleSignOut}
              >
                {t('common.signOut')}
              </button>
            </div>
          </section>
        </main>
      </>
    );
  }

  const profileComplete = isTouristProfileComplete(profile);

  if (!legalConsentAccepted) {
    return (
      <>
        <LanguageSwitcher />
        <ConsentGate
          onAccepted={() => setLegalConsentAccepted(true)}
          onSignOut={signOut}
        />
      </>
    );
  }

  if (!profileComplete || editing) {
    return (
      <>
        <LanguageSwitcher />
        <ProfileFormPage
          userId={user.id}
          initialData={profile}
          requiredCompletion={!profileComplete}
          onSaved={(savedProfile) => {
            if (!profileComplete) {
              showToast(t('profile.registrationCompleted'));
            }
            setProfile(savedProfile);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </>
    );
  }

  return (
    <AuthenticatedPage
      profile={profile}
      onEditProfile={() => setEditing(true)}
    />
  );
}
