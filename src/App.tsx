import { LegalLinks } from './features/legal/LegalDocuments';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { OfflineNotice } from './components/OfflineNotice';
import { useToast } from './components/toast-context';
import {
  clearEmailConfirmationRedirectMarker,
  isEmailConfirmationRedirect,
} from './features/auth/email-confirmation-toast';
import { useAuth } from './features/auth/useAuth';
import { ProfileGate } from './features/profile/ProfileGate';
import { EmailConfirmationPage } from './pages/EmailConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';
import { RegisterPage } from './pages/RegisterPage';
import './App.css';

const landedFromEmailConfirmation = isEmailConfirmationRedirect(
  window.location.href
);

function App() {
  const { t } = useTranslation();
  const { session, loading, isEmailVerified, isPasswordRecovery } = useAuth();
  const { showToast } = useToast();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<
    string | null
  >(null);
  const pendingEmailConfirmationToast = useRef(landedFromEmailConfirmation);

  useEffect(() => {
    if (
      loading ||
      !pendingEmailConfirmationToast.current ||
      isPasswordRecovery ||
      !session ||
      !isEmailVerified ||
      !session.user.email_confirmed_at
    ) {
      return;
    }

    pendingEmailConfirmationToast.current = false;
    clearEmailConfirmationRedirectMarker();

    showToast(
      t('auth.emailConfirmedToast'),
      'success',
      t('auth.emailConfirmedToastDescription')
    );
  }, [isEmailVerified, isPasswordRecovery, loading, session, showToast, t]);

  let content;

  if (loading) {
    content = (
      <main className="auth-shell">
        <p className="loading-message" role="status">
          {t('auth.checkingSession')}
        </p>
      </main>
    );
  } else if (isPasswordRecovery) {
    content = (
      <PasswordRecoveryPage
        onPasswordUpdated={() => {
          setAuthView('login');
          showToast(t('auth.passwordUpdatedToast'));
        }}
      />
    );
  } else if (session) {
    content = <ProfileGate key={session.user.id} />;
  } else if (pendingConfirmationEmail) {
    content = (
      <EmailConfirmationPage
        email={pendingConfirmationEmail}
        onBackHome={() => {
          setPendingConfirmationEmail(null);
          setAuthView('login');
        }}
      />
    );
  } else {
    content =
      authView === 'login' ? (
        <LoginPage onShowRegister={() => setAuthView('register')} />
      ) : (
        <RegisterPage
          onShowLogin={() => setAuthView('login')}
          onAccountCreated={() => showToast(t('auth.accountCreatedToast'))}
          onEmailConfirmationRequired={(email) => {
            setPendingConfirmationEmail(email);
            setAuthView('login');
          }}
        />
      );
  }

  return (
    <>
      {(!session || isPasswordRecovery) && <LanguageSwitcher />}
      {session && !isEmailVerified && !isPasswordRecovery && (
        <aside
          className="verification-notice global-verification-notice"
          role="status"
        >
          <span aria-hidden="true">!</span>
          <p>{t('auth.verificationPersistentNotice')}</p>
        </aside>
      )}
      <OfflineNotice />
      {content}
      <footer className="app-legal-footer"><LegalLinks compact /></footer>
    </>
  );
}

export default App;
