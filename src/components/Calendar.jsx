import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useExams } from '../context/ExamContext';

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TURKISH_DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

export default function Calendar() {
  const { exams } = useExams();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today);

  const [weekStart, setWeekStart] = useState(() => getMonday(today));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const examsByDate = useMemo(() => {
    const map = {};
    for (const exam of exams) {
      const key = dateKey(exam.date);
      if (!map[key]) map[key] = [];
      map[key].push(exam);
    }
    return map;
  }, [exams]);

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  const goToday = () => setWeekStart(getMonday(today));

  const weekEnd = addDays(weekStart, 6);
  const rangeLabel = weekStart.getMonth() === weekEnd.getMonth()
    ? `${weekStart.getDate()} – ${weekEnd.getDate()} ${TURKISH_MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    : `${weekStart.getDate()} ${TURKISH_MONTHS[weekStart.getMonth()]} – ${weekEnd.getDate()} ${TURKISH_MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  return (
    <div className="weekly-calendar">
      <div className="weekly-nav">
        <button className="calendar-nav" onClick={prevWeek} aria-label="Önceki hafta">
          <ChevronLeft size={18} />
        </button>
        <div className="weekly-nav-center">
          <h3 className="weekly-range">{rangeLabel}</h3>
          <button className="weekly-today-btn" onClick={goToday}>Bugün</button>
        </div>
        <button className="calendar-nav" onClick={nextWeek} aria-label="Sonraki hafta">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="weekly-grid">
        {weekDays.map((date, i) => {
          const key = dateKey(date);
          const isToday = key === todayKey;
          const dayExams = examsByDate[key] || [];
          const isPast = date < today;
          return (
            <div key={key} className={['weekly-day', isToday && 'today', isPast && 'past', dayExams.length > 0 && 'has-exams'].filter(Boolean).join(' ')}>
              <div className="weekly-day-header">
                <span className="weekly-day-name">{TURKISH_DAYS_SHORT[i]}</span>
                <span className={`weekly-day-num ${isToday ? 'today-num' : ''}`}>{date.getDate()}</span>
              </div>
              <div className="weekly-day-exams">
                {dayExams.length === 0 && <div className="weekly-no-exam">—</div>}
                {dayExams.map((exam) => (
                  <div key={exam.id} className="weekly-exam-item selected">
                    <div className="weekly-exam-name">{exam.course}</div>
                    {exam.timeStr && <div className="weekly-exam-meta"><Clock size={11} /><span>{exam.timeStr}</span></div>}
                    {exam.classroom && <div className="weekly-exam-meta"><MapPin size={11} /><span>{exam.classroom}</span></div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
