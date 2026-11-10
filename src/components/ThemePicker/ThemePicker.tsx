import {useEffect, useState} from 'react';
import styles from './styles.module.css';

const storageKey = 'computer-technician-tools-theme';
const colorModeKey = 'theme';

const themes = [
  'default',
  'catppuccin',
  'nord',
  'dracula',
  'TKOD',
  'Suprise',
  'amoled',
  'halloween',
  'christmas',
  'galaxy',
  'custom',
] as const;

type ThemeName = (typeof themes)[number];

function isThemeName(value: string | null | undefined): value is ThemeName {
  return value !== null && value !== undefined && (themes as readonly string[]).includes(value);
}

function getInitialTheme(): ThemeName {
  if (typeof document !== 'undefined') {
    const domTheme = document.documentElement.dataset.techTheme;

    if (isThemeName(domTheme)) return domTheme;
  }

  if (typeof window !== 'undefined') {
    let storedTheme: string | null = null;
    try {
      storedTheme = window.localStorage.getItem(storageKey);
    } catch {
      // Storage can be disabled by browser settings.
    }

    if (isThemeName(storedTheme)) return storedTheme;
  }

  return 'default';
}

export default function ThemePicker() {
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.techTheme = theme;
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // Keep the current session usable when storage is disabled.
    }
  }, [theme]);

  const handleThemeChange = (nextTheme: ThemeName) => {
    if (nextTheme === 'Suprise') {
      const root = document.documentElement;

      setTheme('default');
      root.dataset.techTheme = 'default';
      root.dataset.theme = 'light';
      root.style.colorScheme = 'light';
      try {
        window.localStorage.setItem(storageKey, 'default');
        window.localStorage.setItem(colorModeKey, 'light');
      } catch {
        // Keep the current session usable when storage is disabled.
      }

      requestAnimationFrame(() => {
        root.dataset.techTheme = 'default';
        root.dataset.theme = 'light';
        root.style.colorScheme = 'light';
      });

      window.open(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        '_blank',
        'noopener,noreferrer',
      );
      return;
    }

    setTheme(nextTheme);
  };

  return (
    <label className={styles.picker}>
      <span>Theme</span>
      <select
        aria-label="Choose color theme"
        value={theme}
        onChange={(event) => handleThemeChange(event.target.value as ThemeName)}
      >
        <option value="default">Default</option>
        <option value="catppuccin">Catppuccin</option>
        <option value="nord">Nord</option>
        <option value="dracula">Dracula</option>
        <option value="TKOD">TKOD</option>
        <option value="Suprise">Suprise</option>
        <option value="amoled">AMOLED</option>
        <option value="halloween">Halloween</option>
        <option value="christmas">Christmas</option>
        <option value="galaxy">Galaxy</option>
        <option value="custom">Custom</option>
      </select>
    </label>
  );
}
