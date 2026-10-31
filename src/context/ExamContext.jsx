import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import examSchedule from '../data/examSchedule';
import { buildExams, loadSelectedCourses, saveSelectedCourses } from '../utils/examHelpers';

const ExamContext = createContext(null);

const ALL_EXAMS = buildExams(examSchedule);

export function ExamProvider({ children }) {
  const [selectedCourses, setSelectedCourses] = useState(() => {
    // Drop selections for courses that no longer exist in the schedule
    const known = new Set(ALL_EXAMS.map((e) => e.course));
    return loadSelectedCourses().filter((c) => known.has(c));
  });

  // Persist selections
  useEffect(() => {
    saveSelectedCourses(selectedCourses);
  }, [selectedCourses]);

  const toggleCourse = useCallback((course) => {
    setSelectedCourses((prev) =>
      prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedCourses([...new Set(ALL_EXAMS.map((e) => e.course))]);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedCourses([]);
  }, []);

  // Exams of the selected courses (all periods), sorted by date
  const exams = useMemo(
    () => ALL_EXAMS.filter((e) => selectedCourses.includes(e.course)),
    [selectedCourses]
  );

  const value = {
    allExams: ALL_EXAMS,
    exams,
    selectedCourses,
    toggleCourse,
    selectAll,
    deselectAll,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExams() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExams must be used within ExamProvider');
  return ctx;
}
