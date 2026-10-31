import { useState, useEffect } from 'react';
import { ExamProvider } from './context/ExamContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SettingsView from './components/Settings';

const THEME_STORAGE_KEY = 'exam-dashboard-theme';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      const initial = (saved === 'dark' || saved === 'light')
        ? saved
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', initial);
      return initial;
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ExamProvider>
      <Navbar
        activeView={view}
        onChangeView={setView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {view === 'dashboard' ? (
        <Dashboard onNavigateSettings={() => setView('settings')} />
      ) : (
        <SettingsView />
      )}
    </ExamProvider>
  );
}
