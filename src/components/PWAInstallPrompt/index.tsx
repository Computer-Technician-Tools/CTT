import {useEffect, useState} from 'react';
import styles from './styles.module.css';

type InstallChoice = {outcome: 'accepted' | 'dismissed'};
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};
type InstallWindow = Window & {
  __cttPwaInstallPrompt?: InstallEvent;
  __cttPwaInstalled?: boolean;
  __cttInstallSuggestionDismissed?: boolean;
  MSStream?: unknown;
  navigator: Navigator & {standalone?: boolean};
};

export default function PWAInstallPrompt(): React.ReactElement | null {
  const [visible, setVisible] = useState(false);
  const [help, setHelp] = useState(false);
  const [nativePrompt, setNativePrompt] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const appWindow = window as InstallWindow;
    const mobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const installed = appWindow.__cttPwaInstalled ||
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean(appWindow.navigator.standalone);
    setIos(appleMobile);
    if (!mobile || installed || appWindow.__cttInstallSuggestionDismissed) return;

    const updatePrompt = () => setNativePrompt(appWindow.__cttPwaInstallPrompt ?? null);
    const installedHandler = () => {
      appWindow.__cttPwaInstalled = true;
      setVisible(false);
    };
    window.addEventListener('ctt-pwa-install-available', updatePrompt);
    window.addEventListener('ctt-pwa-installed', installedHandler);
    updatePrompt();
    const showTimer = window.setTimeout(() => setVisible(true), 4500);
    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener('ctt-pwa-install-available', updatePrompt);
      window.removeEventListener('ctt-pwa-installed', installedHandler);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    (window as InstallWindow).__cttInstallSuggestionDismissed = true;
    setVisible(false);
  };

  const install = async () => {
    if (!nativePrompt) {
      setHelp(true);
      return;
    }
    await nativePrompt.prompt();
    const choice = await nativePrompt.userChoice;
    (window as InstallWindow).__cttPwaInstallPrompt = undefined;
    setNativePrompt(null);
    if (choice.outcome === 'accepted') setVisible(false);
    else setHelp(true);
  };

  return (
    <aside className={styles.prompt} role="region" aria-label="Install CTT">
      <button className={styles.close} type="button" onClick={dismiss} aria-label="Dismiss install suggestion">×</button>
      <strong>{help ? 'Install CTT on your device' : 'Take CTT with you'}</strong>
      <p>
        {help
          ? ios
            ? 'In Safari, tap Share, then Add to Home Screen.'
            : 'Open your browser menu and choose Install app or Add to Home screen.'
          : 'Add CTT to your home screen for quick access to your technician references.'}
      </p>
      <div className={styles.actions}>
        {!help && <button type="button" className={styles.install} onClick={install}>Install</button>}
        {help && <button type="button" className={styles.install} onClick={dismiss}>Got it</button>}
        {!help && <button type="button" className={styles.later} onClick={dismiss}>Later</button>}
      </div>
    </aside>
  );
}
