import i18n from '../../i18n';
import { isNetworkError } from '../../lib/offline-cache';

export function getVisitErrorMessage(error: unknown): string {
  if (isNetworkError(error)) return i18n.t('offline.actionNotSaved');

  const errorText =
    typeof error === 'object' && error !== null
      ? ['code', 'message', 'details', 'hint']
          .flatMap((key) =>
            key in error ? [String(Reflect.get(error, key))] : []
          )
          .join(' ')
          .toLowerCase()
      : String(error ?? '').toLowerCase();

  if (errorText.includes('minors can be registered only before') || errorText.includes('minors_before_start_only')) return i18n.t('final.minorsLocked');
  if (errorText.includes('route_return_confirmation_required')) return i18n.t('final.returnToStart');
  if (errorText.includes('adult_required')) return i18n.t('final.adultExisting');
  if (errorText.includes('minimum_return_four_hours')) return i18n.t('final.minReturn');
  if (errorText.includes('early_return_required')) return i18n.t('final.earlyRequired');
  if (errorText.includes('early_return_description_required')) return i18n.t('final.otherRequired');

  if (
    errorText.includes('email_not_verified') ||
    errorText.includes('email not verified') ||
    errorText.includes('email not confirmed')
  ) {
    return i18n.t('visits.errors.emailVerificationRequired');
  }

  if (errorText.includes('already belong')) {
    return i18n.t('visits.errors.alreadyActive');
  }

  if (errorText.includes('code not found')) {
    return i18n.t('visits.errors.codeNotFound');
  }

  if (errorText.includes('no longer accepting')) {
    return i18n.t('visits.errors.notAccepting');
  }

  if (errorText.includes('complete your tourist profile')) {
    return i18n.t('visits.errors.profileRequired');
  }

  if (errorText.includes('access') && errorText.includes('denied')) {
    return i18n.t('visits.errors.accessDenied');
  }

  if (errorText.includes('expected return')) {
    return i18n.t('visits.validation.futureReturn');
  }

  if (errorText.includes('scheduled_start_not_reached')) {
    return i18n.t('visits.errors.scheduledStartNotReached');
  }

  if (errorText.includes('minor responsibility consent')) {
    return i18n.t('visits.errors.minorConsentRequired');
  }

  if (errorText.includes('each minor requires')) {
    return i18n.t('visits.errors.invalidMinorData');
  }

  if (errorText.includes('responsible participant must be an adult')) {
    return i18n.t('visits.errors.adultRequiredForMinors');
  }

  return error instanceof TypeError
    ? i18n.t('errors.network')
    : i18n.t('visits.errors.generic');
}
