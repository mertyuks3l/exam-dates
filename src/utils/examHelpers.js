const SELECTED_COURSES_STORAGE_KEY = 'exam-dashboard-selected-courses';

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
 * Build exam objects from the static schedule entries (see src/data/examSchedule.js).
 * `course` (code + name) is the key used for course selection, so a single
 * selection covers the Vize, Final and Bütünleme exams of that course.
 */
export function buildExams(schedule) {
  return schedule
    .map((entry) => {
      const [y, m, d] = entry.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const course = entry.code ? `${entry.code} ${entry.name}` : entry.name;
      return {
        id: `${entry.period}|${course}|${entry.date}|${entry.timeStart}`,
        course,
        code: entry.code,
        name: entry.name,
        group: entry.group,
        period: entry.period,
        date: dateObj,
        dateStr: formatDateStr(dateObj),
        dayName: TURKISH_DAY_NAMES[dateObj.getDay()],
        timeStart: entry.timeStart || '',
        timeEnd: entry.timeEnd || '',
        timeStr: formatTimeStr(entry.timeStart, entry.timeEnd),
        classroom: entry.classroom || '',
        lecturer: entry.lecturer || '',
        note: entry.note || '',
      };
    })
    .sort((a, b) => a.date - b.date || a.timeStart.localeCompare(b.timeStart));
}

/**
 * Load the selected course names from localStorage.
 */
export function loadSelectedCourses() {
  try {
    const raw = localStorage.getItem(SELECTED_COURSES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save the selected course names to localStorage.
 */
export function saveSelectedCourses(courses) {
  localStorage.setItem(SELECTED_COURSES_STORAGE_KEY, JSON.stringify(courses));
}
