import { useState } from 'react';
import { Search, Plus, Trash2, Edit3, X, Check, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useExams } from '../context/ExamContext';
import { daysFromNow } from '../utils/examHelpers';

const emptyForm = {
  course: '',
  date: '',
  timeStart: '',
  timeEnd: '',
  classroom: '',
  lecturer: '',
};

export default function SettingsView() {
  const { exams, addExam, updateExam, deleteExam } = useExams();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.course.trim() || !form.date) return;

    if (editingId) {
      updateExam(editingId, form);
    } else {
      addExam(form);
    }
    resetForm();
  };

  const startEdit = (exam) => {
    const dateVal = exam.date instanceof Date
      ? exam.date.toISOString().split('T')[0]
      : '';
    setForm({
      course: exam.course,
      date: dateVal,
      timeStart: exam.timeStart || '',
      timeEnd: exam.timeEnd || '',
      classroom: exam.classroom || '',
      lecturer: exam.lecturer || '',
    });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deleteExam(id);
    if (editingId === id) resetForm();
  };

  const filtered = exams
    .filter((exam) =>
      exam.course.toLowerCase().includes(search.toLowerCase()) ||
      (exam.lecturer && exam.lecturer.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => a.date - b.date);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Sınavlarım</h1>
        <p>Sınavlarınızı ekleyin, düzenleyin veya silin. Verileriniz tarayıcınızda saklanır.</p>
      </div>

      {/* Add / Edit Form */}
      {!showForm ? (
        <button className="add-exam-btn" onClick={() => { resetForm(); setShowForm(true); }} id="add-exam-button">
          <Plus size={18} />
          Yeni Sınav Ekle
        </button>
      ) : (
        <form className="exam-form" onSubmit={handleSubmit}>
          <div className="exam-form-header">
            <h3>{editingId ? 'Sınavı Düzenle' : 'Yeni Sınav Ekle'}</h3>
            <button type="button" className="form-close-btn" onClick={resetForm} aria-label="Kapat">
              <X size={18} />
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group form-span-2">
              <label htmlFor="exam-course">Ders Adı *</label>
              <input
                id="exam-course"
                type="text"
                placeholder="Örn: CSE 1124 Object Oriented Programming"
                value={form.course}
                onChange={handleChange('course')}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="exam-date">Tarih *</label>
              <input
                id="exam-date"
                type="date"
                value={form.date}
                onChange={handleChange('date')}
                required
              />
            </div>

            <div className="form-group form-time-row">
              <label>Saat</label>
              <div className="time-inputs">
                <input
                  id="exam-time-start"
                  type="time"
                  value={form.timeStart}
                  onChange={handleChange('timeStart')}
                />
                <span className="time-separator">–</span>
                <input
                  id="exam-time-end"
                  type="time"
                  value={form.timeEnd}
                  onChange={handleChange('timeEnd')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="exam-classroom">Derslik <span className="optional-tag">(Opsiyonel)</span></label>
              <input
                id="exam-classroom"
                type="text"
                placeholder="Örn: C202-203"
                value={form.classroom}
                onChange={handleChange('classroom')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="exam-lecturer">Öğretim Üyesi <span className="optional-tag">(Opsiyonel)</span></label>
              <input
                id="exam-lecturer"
                type="text"
                placeholder="Örn: Prof. Dr. ..."
                value={form.lecturer}
                onChange={handleChange('lecturer')}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="form-cancel-btn" onClick={resetForm}>
              İptal
            </button>
            <button type="submit" className="form-submit-btn" id="submit-exam-button">
              <Check size={16} />
              {editingId ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      {exams.length > 0 && (
        <>
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
            <span>{exams.length} sınav kayıtlı</span>
          </div>
        </>
      )}

      {/* Exam List */}
      <div className="course-list">
        {filtered.length === 0 && exams.length === 0 && !showForm && (
          <div className="empty-state">
            <Calendar />
            <h3>Henüz sınav eklenmedi</h3>
            <p>Yukarıdaki butona tıklayarak ilk sınavınızı ekleyin.</p>
          </div>
        )}
        {filtered.length === 0 && exams.length > 0 && (
          <div className="empty-state">
            <Search />
            <h3>Sonuç bulunamadı</h3>
            <p>Arama kriterlerinize uygun sınav yok.</p>
          </div>
        )}
        {filtered.map((exam, i) => {
          const days = daysFromNow(exam.date);
          const isPast = days < 0;
          return (
            <div
              key={exam.id}
              className={`course-item ${isPast ? 'past-exam' : ''} ${editingId === exam.id ? 'editing' : ''}`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="course-info">
                <div className="course-name">{exam.course}</div>
                <div className="course-meta">
                  <span className="meta-chip">
                    <Calendar size={12} /> {exam.dateStr}
                  </span>
                  {exam.timeStr && (
                    <span className="meta-chip">
                      <Clock size={12} /> {exam.timeStr}
                    </span>
                  )}
                  {exam.classroom && (
                    <span className="meta-chip">
                      <MapPin size={12} /> {exam.classroom}
                    </span>
                  )}
                  {exam.lecturer && (
                    <span className="meta-chip">
                      <User size={12} /> {exam.lecturer}
                    </span>
                  )}
                </div>
              </div>
              <div className="exam-actions">
                <button
                  className="exam-action-btn edit"
                  onClick={() => startEdit(exam)}
                  aria-label="Düzenle"
                  title="Düzenle"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="exam-action-btn delete"
                  onClick={() => handleDelete(exam.id)}
                  aria-label="Sil"
                  title="Sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
