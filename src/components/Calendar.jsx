import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useExams } from '../context/ExamContext';
import { daysFromNow } from '../utils/examHelpers';

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TURKISH_DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const PERIOD_CLASS = {
  Vize: 'period-vize',
  Final: 'period-final',
  Bütünleme: 'period-butunleme',
};

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
  const todayMonday = getMonday(today);

  // Default to the week of the next upcoming exam (or today if none)
  const initialMonday = useMemo(() => {
    const upcoming = exams.find((e) => daysFromNow(e.date) >= 0);
    return upcoming ? getMonday(upcoming.date) : getMonday(new Date());
  }, [exams]);

  const [weekStart, setWeekStart] = useState(() => initialMonday);

  // Keep calendar synced to next exam week if the user changes course selection
  // and current week has no exams
  useEffect(() => {
    setWeekStart(initialMonday);
  }, [initialMonday]);

  // Distinct exam weeks for quick jumping (e.g. Vize 1, Vize 2, Final 1, Final 2, Bütünleme)
  const examWeeks = useMemo(() => {
    const byPeriod = new Map();
    for (const exam of exams) {
      const monday = getMonday(exam.date);
      const k = dateKey(monday);
      const p = exam.period || 'Sınav';
      if (!byPeriod.has(p)) byPeriod.set(p, new Map());
      const pMap = byPeriod.get(p);
      if (!pMap.has(k)) {
        pMap.set(k, { key: k, monday, period: p, count: 0 });
      }
      pMap.get(k).count += 1;
    }

    const pills = [];
    for (const [period, pMap] of byPeriod.entries()) {
      const weeks = [...pMap.values()].sort((a, b) => a.monday - b.monday);
      weeks.forEach((w, idx) => {
        pills.push({
          ...w,
          label: weeks.length > 1 ? `${period} ${idx + 1}. Hafta` : period,
        });
      });
    }
    return pills;
  }, [exams]);

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
  const goToday = () => setWeekStart(todayMonday);

  const currentWeekKey = dateKey(weekStart);
  const isCurrentWeekToday = currentWeekKey === dateKey(todayMonday);

  const weekEnd = addDays(weekStart, 6);
  const rangeLabel = weekStart.getMonth() === weekEnd.getMonth()
    ? `${weekStart.getDate()} – ${weekEnd.getDate()} ${TURKISH_MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    : `${weekStart.getDate()} ${TURKISH_MONTHS[weekStart.getMonth()]} – ${weekEnd.getDate()} ${TURKISH_MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  return (
    <div className="weekly-calendar">
      <div className="weekly-nav">
        <div className="weekly-nav-left">
          <h3 className="weekly-range">{rangeLabel}</h3>
          {examWeeks.length > 0 && (
            <div className="weekly-jump-pills">
              {examWeeks.map((w) => {
                const isActive = currentWeekKey === w.key;
                return (
                  <button
                    key={`${w.period}-${w.key}`}
                    type="button"
                    className={`weekly-jump-pill ${PERIOD_CLASS[w.period] || ''} ${isActive ? 'active' : ''}`}
                    onClick={() => setWeekStart(w.monday)}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="weekly-nav-controls">
          <button className="calendar-nav" onClick={prevWeek} aria-label="Önceki hafta">
            <ChevronLeft size={16} />
          </button>
          <button
            className={`weekly-today-btn ${isCurrentWeekToday ? 'active' : ''}`}
            onClick={goToday}
          >
            Bugün
          </button>
          <button className="calendar-nav" onClick={nextWeek} aria-label="Sonraki hafta">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="weekly-grid">
        {weekDays.map((date, i) => {
          const key = dateKey(date);
          const isToday = key === todayKey;
          const dayExams = examsByDate[key] || [];
          const isPast = date < today;
          return (
            <div
              key={key}
              className={[
                'weekly-day',
                isToday && 'today',
                isPast && 'past',
                dayExams.length > 0 && 'has-exams',
              ].filter(Boolean).join(' ')}
            >
              <div className="weekly-day-header">
                <span className="weekly-day-name">{TURKISH_DAYS_SHORT[i]}</span>
                <span className={`weekly-day-num ${isToday ? 'today-num' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
              <div className="weekly-day-exams">
                {dayExams.length === 0 && <div className="weekly-no-exam">—</div>}
                {dayExams.map((exam) => (
                  <div
                    key={exam.id}
                    className={`weekly-exam-item selected ${PERIOD_CLASS[exam.period] || ''}`}
                  >
                    <div className="weekly-exam-name">
                      {exam.code ? `${exam.code} · ${exam.name}` : exam.course}
                    </div>
                    {exam.timeStr && (
                      <div className="weekly-exam-meta">
                        <Clock size={11} />
                        <span>{exam.timeStr}</span>
                      </div>
                    )}
                    {exam.classroom && (
                      <div className="weekly-exam-meta">
                        <MapPin size={11} />
                        <span>{exam.classroom}</span>
                      </div>
                    )}
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
