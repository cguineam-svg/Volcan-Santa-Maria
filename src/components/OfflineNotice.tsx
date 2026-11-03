import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function OfflineNotice() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;
  return <p className="offline-notice" role="status">{t('offline.notice')}</p>;
}
