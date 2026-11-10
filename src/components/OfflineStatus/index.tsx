import {useEffect, useState} from 'react';
import styles from './styles.module.css';

export default function OfflineStatus() {
  const [visible, setVisible] = useState(false);
  const [checking, setChecking] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);

  useEffect(() => {
    const dismissed = () => {
      try { return sessionStorage.getItem('ctt-offline-choice') === 'continue'; }
      catch { return false; }
    };
    const showOffline = () => {
      if (dismissed()) return;
      setVisible(true);
      setRetryFailed(false);
    };
    const showOnline = () => {
      try { sessionStorage.removeItem('ctt-offline-choice'); } catch {}
      setVisible(false);
      setChecking(false);
      setRetryFailed(false);
    };
    const update = () => (navigator.onLine ? showOnline() : showOffline());
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CTT_OFFLINE') showOffline();
      if (event.data?.type === 'CTT_ONLINE') showOnline();
    };

    update();
    window.addEventListener('online', showOnline);
    window.addEventListener('offline', showOffline);
    navigator.serviceWorker?.addEventListener('message', onWorkerMessage);
    return () => {
      window.removeEventListener('online', showOnline);
      window.removeEventListener('offline', showOffline);
      navigator.serviceWorker?.removeEventListener('message', onWorkerMessage);
    };
  }, []);

  if (!visible) return null;

  const continueOffline = () => {
    try { sessionStorage.setItem('ctt-offline-choice', 'continue'); } catch {}
    setVisible(false);
  };
  const tryReconnect = async () => {
    setChecking(true);
    setRetryFailed(false);
    try {
      const response = await fetch(window.location.href, {method: 'HEAD', cache: 'no-store'});
      if (!response.ok) throw new Error('Page is still unavailable');
      window.location.reload();
    } catch {
      setChecking(false);
      setRetryFailed(true);
    }
  };

  return (
    <div className={styles.backdrop}>
      <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="ctt-offline-title" aria-describedby="ctt-offline-description">
        <span className={styles.mark} aria-hidden="true">CTT</span>
        <h2 id="ctt-offline-title">You’re offline</h2>
        <p id="ctt-offline-description">You can keep reading pages and resources saved on this device. Website favicons and external links may be unavailable.</p>
        {retryFailed && <p className={styles.error} role="status">Still offline. You can continue with saved pages or try again.</p>}
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={continueOffline}>Continue offline</button>
          <button className={styles.secondary} type="button" onClick={tryReconnect} disabled={checking}>
            {checking ? 'Checking connection…' : 'Try reconnecting'}
          </button>
        </div>
      </section>
    </div>
  );
}
