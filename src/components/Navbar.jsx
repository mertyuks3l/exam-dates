import { CalendarDays, SlidersHorizontal, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeView, onChangeView, theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">
            <CalendarDays size={17} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Sınav Takvimi</span>
            <span className="brand-term">2026–27 Güz</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-tabs">
            <button
              className={`nav-tab ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onChangeView('dashboard')}
            >
              <CalendarDays size={15} />
              Takvim
            </button>
            <button
              className={`nav-tab ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => onChangeView('settings')}
            >
              <SlidersHorizontal size={15} />
              Ders Seçimi
            </button>
          </div>

          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
            title={isDark ? 'Açık Tema' : 'Koyu Tema'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
