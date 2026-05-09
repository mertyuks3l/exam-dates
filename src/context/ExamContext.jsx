import { createContext, useContext, useState, useCallback } from 'react';
import { loadExamsFromStorage, saveExamsToStorage, createExam } from '../utils/examHelpers';

const ExamContext = createContext(null);

export function ExamProvider({ children }) {
  const [exams, setExams] = useState(() => loadExamsFromStorage());

  const persist = useCallback((updatedExams) => {
    const sorted = [...updatedExams].sort((a, b) => a.date - b.date);
    setExams(sorted);
    saveExamsToStorage(sorted);
  }, []);

  const addExam = useCallback((formData) => {
    const newExam = createExam(formData);
    persist([...exams, newExam]);
    return newExam;
  }, [exams, persist]);

  const updateExam = useCallback((id, formData) => {
    const updated = exams.map((e) => {
      if (e.id !== id) return e;
      return createExam({ ...formData, id });
    });
    // Preserve original id
    const idx = updated.findIndex((e) => e.id !== id && exams.find((x) => x.id === id));
    const finalExams = exams.map((e) => {
      if (e.id !== id) return e;
      const rebuilt = createExam(formData);
      return { ...rebuilt, id };
    });
    persist(finalExams);
  }, [exams, persist]);

  const deleteExam = useCallback((id) => {
    persist(exams.filter((e) => e.id !== id));
  }, [exams, persist]);

  const value = {
    exams,
    addExam,
    updateExam,
    deleteExam,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExams() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error('useExams must be used within ExamProvider');
  return ctx;
}
