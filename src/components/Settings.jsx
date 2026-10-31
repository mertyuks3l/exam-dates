import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useExams } from '../context/ExamContext';

const GROUP_LABELS = {
  Ortak: 'Ortak Dersler',
  1: '1. Sınıf',
  2: '2. Sınıf',
  3: '3. Sınıf',
  4: '4. Sınıf',
};

const GROUP_ORDER = ['Ortak', '1', '2', '3', '4'];

export default function SettingsView() {
  const { allExams, selectedCourses, toggleCourse, selectAll, deselectAll } = useExams();
  const [search, setSearch] = useState('');

  // One entry per course, with all of its exams (Vize / Final / Bütünleme)
  const courses = useMemo(() => {
    const map = new Map();
    for (const exam of allExams) {
      if (!map.has(exam.course)) {
        map.set(exam.course, { course: exam.course, group: exam.group, lecturer: exam.lecturer, exams: [] });
      }
      const entry = map.get(exam.course);
      if (!entry.lecturer && exam.lecturer) entry.lecturer = exam.lecturer;
      entry.exams.push(exam);
    }
    return [...map.values()];
  }, [allExams]);

  const query = search.toLowerCase();
  const filtered = courses.filter((c) =>
    c.course.toLowerCase().includes(query) ||
    c.lecturer.toLowerCase().includes(query)
  );

  const groups = GROUP_ORDER
    .map((g) => ({ group: g, items: filtered.filter((c) => c.group === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Ders Seçimi</h1>
        <p>Kayıtlı olduğunuz dersleri seçin. Vize, final ve bütünleme sınavları otomatik olarak eklenir.</p>
      </div>

      <div className="settings-search">
        <Search />
        <input
          type="text"
          placeholder="Ders veya öğretim üyesi ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="course-search"
        />
      </div>

      <div className="select-bar">
        <span>{selectedCourses.length} / {courses.length} ders seçildi</span>
        <div>
          <button onClick={selectAll}>Tümünü Seç</button>
          <button onClick={deselectAll}>Temizle</button>
        </div>
      </div>

      {groups.map(({ group, items }) => (
        <div key={group}>
          <div className="section-header">
            <h2 className="section-title">{GROUP_LABELS[group] || group}</h2>
            <span className="section-count">{items.length}</span>
          </div>
          <div className="course-list">
            {items.map((c, i) => {
              const isSelected = selectedCourses.includes(c.course);
              return (
                <div
                  key={c.course}
                  className={`course-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleCourse(c.course)}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <div className="course-info">
                    <div className="course-name">{c.course}</div>
                    <div className="course-meta">
                      {c.exams.map((e) => (
                        <span key={e.id} className="meta-chip">
                          <strong>{e.period}:</strong> {e.dateStr} {e.timeStr}
                        </span>
                      ))}
                      {c.lecturer && <span className="meta-chip">{c.lecturer}</span>}
                    </div>
                  </div>
                  <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCourse(c.course)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="empty-state">
          <Search />
          <h3>Sonuç bulunamadı</h3>
          <p>Arama kriterlerinize uygun ders yok.</p>
        </div>
      )}
    </div>
  );
}
