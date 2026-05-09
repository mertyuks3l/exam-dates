import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { getExamStatus, getDaysLabel, daysFromNow } from '../utils/examHelpers';

const badgeLabels = {
  today: 'Bugün',
  soon: 'Yakında',
  upcoming: 'Yaklaşıyor',
  past: 'Geçti',
};

export default function ExamCard({ exam, style }) {
  const status = getExamStatus(exam.date);
  const daysLabel = getDaysLabel(exam.date);

  return (
    <div className="exam-card" style={style}>
      <div className="exam-card-header">
        <div className="exam-course-name">{exam.course}</div>
        <span className={`exam-badge ${status}`}>{badgeLabels[status]}</span>
      </div>
      <div className="exam-details">
        <div className="exam-detail"><Calendar /><span>{exam.dateStr}</span></div>
        {exam.timeStr && <div className="exam-detail"><Clock /><span>{exam.timeStr}</span></div>}
        {exam.classroom && <div className="exam-detail"><MapPin /><span>{exam.classroom}</span></div>}
        {exam.lecturer && <div className="exam-detail"><User /><span>{exam.lecturer}</span></div>}
      </div>
      {status !== 'past' && (
        <div className="exam-days-left">
          {status === 'today' ? (<>🔴 <strong>Bugün sınav var!</strong> Başarılar 🍀</>) : (<>⏳ <strong>{daysLabel}</strong></>)}
        </div>
      )}
    </div>
  );
}
