const EXAMS_STORAGE_KEY = 'exam-dashboard-exams';

/**
 * Calculate the difference in calendar days from today.
 * Positive = future, negative = past, 0 = today.
 */
export function daysFromNow(examDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const exam = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
  const diff = exam - today;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get a status badge type for the exam.
 */
export function getExamStatus(examDate) {
  const days = daysFromNow(examDate);
  if (days < 0) return 'past';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'upcoming';
}

/**
 * Get a human-readable label for days remaining.
 */
export function getDaysLabel(examDate) {
  const days = daysFromNow(examDate);
  if (days < 0) return `${Math.abs(days)} gün önce`;
  if (days === 0) return 'Bugün!';
  if (days === 1) return 'Yarın';
  return `${days} gün kaldı`;
}

/**
 * Format a Date object to a display string like "06.04.2026 Pazartesi".
 */
const TURKISH_DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function formatDateStr(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const dayName = TURKISH_DAY_NAMES[date.getDay()];
  return `${d}.${m}.${y} ${dayName}`;
}

/**
 * Format time range string.
 */
export function formatTimeStr(start, end) {
  if (!start && !end) return '';
  if (start && end) return `${start}-${end}`;
  return start || end;
}

/**
 * Create an exam object from form data.
 */
export function createExam({ course, date, timeStart, timeEnd, classroom, lecturer }) {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return {
    id: crypto.randomUUID(),
    course: course.trim(),
    date: dateObj,
    dateStr: formatDateStr(dateObj),
    dayName: TURKISH_DAY_NAMES[dateObj.getDay()],
    timeStart: timeStart || '',
    timeEnd: timeEnd || '',
    timeStr: formatTimeStr(timeStart, timeEnd),
    classroom: classroom?.trim() || '',
    lecturer: lecturer?.trim() || '',
  };
}

/**
 * Load exams from localStorage.
 */
export function loadExamsFromStorage() {
  try {
    const raw = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((e) => ({
      ...e,
      date: new Date(e.date),
    })).sort((a, b) => a.date - b.date);
  } catch {
    return [];
  }
}

/**
 * Save exams to localStorage.
 */
export function saveExamsToStorage(exams) {
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
}
