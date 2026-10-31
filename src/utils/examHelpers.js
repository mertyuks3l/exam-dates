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

/**
 * Export given exams to an RFC 5545 .ics calendar file and trigger download.
 */
export function exportExamsToICS(exams) {
  if (!exams || exams.length === 0) return;

  const pad = (n) => String(n).padStart(2, '0');
  const formatICSDateTime = (dateObj, hhmm) => {
    const y = dateObj.getFullYear();
    const m = pad(dateObj.getMonth() + 1);
    const d = pad(dateObj.getDate());
    const [hh, mm] = (hhmm || '09:00').split(':').map(Number);
    return `${y}${m}${d}T${pad(hh)}${pad(mm)}00`;
  };

  const escapeICS = (str) =>
    (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');

  const stamp = formatICSDateTime(new Date(), '00:00') + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sinav Takvimi//2026-2027 Guz//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:2026-27 Güz Sınav Takvimi',
  ];

  for (const exam of exams) {
    const startTime = exam.timeStart || '09:00';
    let endTime = exam.timeEnd;
    if (!endTime) {
      const [h, m] = startTime.split(':').map(Number);
      endTime = `${pad(Math.min(23, h + 1))}:${pad(m || 0)}`;
    }

    const dtStart = formatICSDateTime(exam.date, startTime);
    const dtEnd = formatICSDateTime(exam.date, endTime);
    const summary = `[${exam.period}] ${exam.course}`;
    const descParts = [];
    if (exam.period) descParts.push(`Sınav Dönemi: ${exam.period}`);
    if (exam.lecturer) descParts.push(`Öğretim Üyesi: ${exam.lecturer}`);
    if (exam.classroom) descParts.push(`Derslik: ${exam.classroom}`);
    if (exam.note) descParts.push(`Not: ${exam.note}`);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeICS(exam.id)}@exam-dates`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(summary)}`,
      ...(exam.classroom ? [`LOCATION:${escapeICS(exam.classroom)}`] : []),
      ...(descParts.length > 0 ? [`DESCRIPTION:${escapeICS(descParts.join('\n'))}`] : []),
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(summary)} 1 saat sonra başlayacak`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '2026-27-guz-sinav-takvimi.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
