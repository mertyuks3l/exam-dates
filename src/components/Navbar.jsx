import { CalendarDays, SlidersHorizontal } from 'lucide-react';

export default function Navbar({ activeView, onChangeView }) {
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
      </div>
    </nav>
  );
}
