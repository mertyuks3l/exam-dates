import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, AlertTriangle, Settings, Tag } from 'lucide-react';
import { useExams } from '../context/ExamContext';
import { daysFromNow, getExamStatus } from '../utils/examHelpers';
import ExamCard from './ExamCard';
import CalendarView from './Calendar';

export default function Dashboard({ onNavigateSettings }) {
  const { exams, selectedCourses } = useExams();
  const [now, setNow] = useState(new Date());

  // Update every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter exams
  const upcomingExams = exams.filter((e) => daysFromNow(e.date) >= 0);
  const todayExams = exams.filter((e) => daysFromNow(e.date) === 0);
  const futureExams = exams.filter((e) => daysFromNow(e.date) > 0);
  const nextExam = futureExams.length > 0 ? futureExams[0] : (todayExams.length > 0 ? todayExams[0] : null);

  // Countdown calculation for next exam (counts down to exam start time)
  function getCountdown(exam) {
    const examStart = new Date(exam.date);
    if (exam.timeStart) {
      const [hours, minutes] = exam.timeStart.split(':').map(Number);
      examStart.setHours(hours, minutes, 0, 0);
    }
    const diff = examStart - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }

  if (selectedCourses.length === 0) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Sınav takviminizin genel görünümü</p>
        </div>
        <div className="empty-state">
          <AlertTriangle />
          <h3>Henüz ders seçilmedi</h3>
          <p>Sınavlarınızı takip etmek için önce Ayarlar sayfasından derslerinizi seçin.</p>
          <button className="go-settings-btn" onClick={onNavigateSettings}>
            <Settings size={16} />
            Ders Seçimine Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>{selectedCourses.length} ders takip ediliyor · {upcomingExams.length} yaklaşan sınav</p>
      </div>

      {/* Next Exam Hero Card */}
      {nextExam && (
        <div className="hero-card">
          <div className="hero-label">
            <span className="pulse-dot"></span>
            {daysFromNow(nextExam.date) === 0 ? 'Bugünkü Sınav' : 'Sıradaki Sınav'}
          </div>
          <div className="hero-course">{nextExam.course}</div>
          <div className="hero-meta">
            <span className="hero-meta-item">
              <Tag size={15} /> {nextExam.period}
            </span>
            <span className="hero-meta-item">
              <Calendar size={15} /> {nextExam.dateStr}
            </span>
            <span className="hero-meta-item">
              <Clock size={15} /> {nextExam.timeStr}
            </span>
            {nextExam.classroom && (
              <span className="hero-meta-item">
                <MapPin size={15} /> {nextExam.classroom}
              </span>
            )}
            {nextExam.lecturer && (
              <span className="hero-meta-item">
                <User size={15} /> {nextExam.lecturer}
              </span>
            )}
          </div>
          {daysFromNow(nextExam.date) >= 0 && (() => {
            const cd = getCountdown(nextExam);
            const isUrgent = cd.days <= 1;
            return (
              <div className={`hero-countdown ${isUrgent ? 'urgent' : ''}`}>
                <div className="countdown-unit">
                  <div className="countdown-value">{cd.days}</div>
                  <div className="countdown-label">Gün</div>
                </div>
                <div className="countdown-unit">
                  <div className="countdown-value">{String(cd.hours).padStart(2, '0')}</div>
                  <div className="countdown-label">Saat</div>
                </div>
                <div className="countdown-unit">
                  <div className="countdown-value">{String(cd.minutes).padStart(2, '0')}</div>
                  <div className="countdown-label">Dakika</div>
                </div>
                <div className="countdown-unit countdown-seconds">
                  <div className="countdown-value">{String(cd.seconds).padStart(2, '0')}</div>
                  <div className="countdown-label">Saniye</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Today's Exams */}
      {todayExams.length > 0 && (
        <div className="today-section">
          <div className="today-banner">
            <div className="today-icon">
              <AlertTriangle size={20} />
            </div>
            <div className="today-banner-text">
              <h3>Bugün {todayExams.length} sınavınız var!</h3>
              <p>Hazırlıklarınızı tamamladığınızdan emin olun. Başarılar! 🍀</p>
            </div>
          </div>
          <div className="exam-grid">
            {todayExams.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <CalendarView />

      {/* Upcoming Exams */}
      {futureExams.length > 0 && (
        <div>
          <div className="section-header">
            <h2 className="section-title">
              <Calendar size={18} />
              Yaklaşan Sınavlar
            </h2>
            <span className="section-count">{futureExams.length}</span>
          </div>
          <div className="exam-grid">
            {futureExams.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} style={{ animationDelay: `${i * 0.06}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* All selected exams passed */}
      {upcomingExams.length === 0 && (
        <div className="empty-state">
          <Calendar />
          <h3>Tüm sınavlar tamamlandı! 🎉</h3>
          <p>Seçili derslerinizin tüm sınavları geçmiş görünüyor.</p>
        </div>
      )}
    </div>
  );
}
