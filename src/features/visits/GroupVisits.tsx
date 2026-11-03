import { ChangeRouteDialog } from '../routes/ChangeRouteDialog';
import { isAdult } from '../../../shared/account-policy';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteInfoScreen } from '../routes/RouteInfoScreen';
import { preloadRoutesForOffline } from '../routes/route-service';
import type { RouteTab } from '../routes/route-types';
import { CreateVisitForm } from './CreateVisitForm';
import { GroupVisitScreen } from './GroupVisitScreen';
import { JoinVisitForm } from './JoinVisitForm';
import { useActiveGroupVisit } from './useActiveGroupVisit';
import { VisitHistory } from './VisitHistory';
import { useToast } from '../../components/toast-context';

type GroupVisitsProps = {
  currentUserId: string;
  currentUserName: string;
  dateOfBirth: string;
};

type VisitView = 'home' | 'create' | 'join' | 'route';

export function GroupVisits({
  currentUserId,
  currentUserName,
  dateOfBirth,
}: GroupVisitsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [view, setView] = useState<VisitView>('home');
  const [changingRoute, setChangingRoute] = useState(false);
  const [routeTab, setRouteTab] = useState<RouteTab>('recommendations');
  const {
    details,
    loading,
    error,
    openVisit,
    refreshActiveVisit,
    refreshDetails,
    clearVisit,
  } = useActiveGroupVisit(currentUserId);

  useEffect(() => { preloadRoutesForOffline(); }, []);

  if (loading) {
    return (
      <section className="visits-loading" aria-live="polite">
        <p>{t('visits.loading')}</p>
      </section>
    );
  }

  if (view === 'route') {
    return (
      <>
        <RouteInfoScreen key={details?.routeId} routeId={details?.routeId} initialTab={routeTab} onTabChange={setRouteTab} onBack={() => setView('home')}
          onChangeRoute={details && ['forming', 'in_progress'].includes(details.status) && details.participants.some((p) => p.userId === currentUserId && p.memberRole === 'leader' && ['active', 'returning_early'].includes(p.memberStatus)) ? () => setChangingRoute(true) : undefined} />
        {changingRoute && details && <ChangeRouteDialog visitId={details.visitId} routeId={details.routeId}
          started={Boolean(details.startedAt) || details.status === 'in_progress'} onClose={() => setChangingRoute(false)} onChanged={refreshDetails} />}
      </>
    );
  }

  if (details) {
    return (
      <GroupVisitScreen
        currentUserId={currentUserId}
        details={details}
        loadError={error}
        onRefresh={refreshDetails}
        onVisitClosed={(message) => {
          clearVisit();
          setView('home');
          if (message) showToast(message, 'success');
        }}
        onOpenRoute={(tab) => {
          setRouteTab(tab);
          setView('route');
        }}
      />
    );
  }

  if (error) {
    return (
      <section className="visits-error" aria-labelledby="visits-error-title">
        <h2 id="visits-error-title">{t('visits.errors.loadTitle')}</h2>
        <p className="form-message error-message" role="alert">
          {error}
        </p>
        <button
          className="primary-button visit-submit"
          type="button"
          onClick={() => void refreshActiveVisit()}
        >
          {t('profile.retry')}
        </button>
      </section>
    );
  }

  if (view === 'create') {
    return (
      <CreateVisitForm
        currentUserName={currentUserName}
        onCreated={openVisit}
        onCancel={() => setView('home')}
      />
    );
  }

  if (view === 'join') {
    return (
      <JoinVisitForm onJoined={openVisit} onCancel={() => setView('home')} />
    );
  }

  return (
    <div className="visits-dashboard">
      <section className="visits-home" aria-labelledby="visits-title">
        <header className="visit-section-header centered">
          <span className="eyebrow">{t('common.brand')}</span>
          <h2 id="visits-title">{t('visits.title')}</h2>
          <p>{t('visits.subtitle')}</p>
        </header>
        {!isAdult(dateOfBirth) && <p role="alert" className="form-message error-message">{t('final.adultExisting')}</p>}
        <div className="visit-primary-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => setView('create')}
            disabled={!isAdult(dateOfBirth)}
          >
            {t('visits.create.action')}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setView('join')}
            disabled={!isAdult(dateOfBirth)}
          >
            {t('visits.join.action')}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setRouteTab('recommendations');
              setView('route');
            }}
          >
            {t('routes.open')}
          </button>
        </div>
      </section>
      <VisitHistory />
    </div>
  );
}
