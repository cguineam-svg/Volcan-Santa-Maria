import { useCallback, useEffect, useState } from 'react';
import { getVisitErrorMessage } from './visit-errors';
import { getGroupVisitDetails, getMyActiveGroupVisit } from './visit-service';
import type { GroupVisitDetails } from './visit-types';

export function useActiveGroupVisit(currentUserId: string) {
  const [details, setDetails] = useState<GroupVisitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasVisit = details !== null;

  const openVisit = useCallback(
    async (visitId: string) => {
      const nextDetails = await getGroupVisitDetails(visitId);
      const ownMembership = nextDetails.participants.find(
        (participant) => participant.userId === currentUserId
      );
      const membershipIsActive =
        ownMembership?.memberStatus === 'active' ||
        ownMembership?.memberStatus === 'returning_early' ||
        (ownMembership?.memberRole === 'leader' &&
          ownMembership.memberStatus === 'returned_early');

      if (
        nextDetails.status === 'completed' ||
        (nextDetails.status !== 'cancelled' && membershipIsActive)
      ) {
        setDetails(nextDetails);
      } else {
        setDetails(null);
      }

      setError(null);
    },
    [currentUserId]
  );

  const refreshActiveVisit = useCallback(async () => {
    // A visit already on screen refreshes behind it: on a weak signal, coming back
    // to the app must not hide the map behind a loading message.
    if (!hasVisit) setLoading(true);
    setError(null);

    try {
      const activeVisit = await getMyActiveGroupVisit();

      if (activeVisit) {
        await openVisit(activeVisit.visit_id);
      } else {
        setDetails(null);
      }
    } catch (loadError) {
      setError(getVisitErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [hasVisit, openVisit]);

  const refreshDetails = useCallback(async () => {
    if (
      !details ||
      (details.status !== 'forming' && details.status !== 'in_progress')
    ) {
      return;
    }

    try {
      await openVisit(details.visitId);
    } catch (loadError) {
      setError(getVisitErrorMessage(loadError));
    }
  }, [details, openVisit]);

  useEffect(() => {
    let active = true;

    void getMyActiveGroupVisit()
      .then((activeVisit) =>
        activeVisit ? getGroupVisitDetails(activeVisit.visit_id) : null
      )
      .then((activeDetails) => {
        if (!active) return;

        setDetails(activeDetails);
        setError(null);
      })
      .catch((loadError) => {
        if (active) setError(getVisitErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshActiveVisit();
    };
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshActiveVisit]);

  return {
    details,
    loading,
    error,
    openVisit,
    refreshActiveVisit,
    refreshDetails,
    clearVisit: () => {
      setDetails(null);
      setError(null);
    },
  };
}
