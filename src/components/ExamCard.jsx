import { Calendar, Clock, MapPin, User, Info } from 'lucide-react';
import { getExamStatus, getDaysLabel } from '../utils/examHelpers';

const badgeLabels = {
  today: 'Bugün',
  soon: 'Yakında',
  upcoming: 'Planlandı',
  past: 'Tamamlandı',
};

const periodClass = {
  Vize: 'period-vize',
  Final: 'period-final',
  Bütünleme: 'period-butunleme',
};

export default function ExamCard({ exam, style }) {
  const status = getExamStatus(exam.date);
  const daysLabel = getDaysLabel(exam.date);

  return (
    <div className="exam-card" style={style}>
      <div className="exam-card-top">
        <div className="exam-tags">
          {exam.code && <span className="course-code-tag">{exam.code}</span>}
          {exam.period && (
            <span className={`period-tag ${periodClass[exam.period] || ''}`}>
              {exam.period}
            </span>
          )}
        </div>
        <span className={`exam-badge ${status}`}>{badgeLabels[status]}</span>
      </div>

      <div className="exam-course-name">{exam.name || exam.course}</div>

      <div className="exam-details">
        <div className="exam-detail">
          <Calendar />
          <span>{exam.dateStr}</span>
        </div>
        {exam.timeStr && (
          <div className="exam-detail">
            <Clock />
            <span>{exam.timeStr}</span>
          </div>
        )}
        {exam.classroom && (
          <div className="exam-detail">
            <MapPin />
            <span>{exam.classroom}</span>
          </div>
        )}
        {exam.lecturer && (
          <div className="exam-detail">
            <User />
            <span>{exam.lecturer}</span>
          </div>
        )}
        {exam.note && (
          <div className="exam-detail">
            <Info />
            <span>{exam.note}</span>
          </div>
        )}
      </div>

      {status !== 'past' && (
        <div className="exam-days-left">
          {status === 'today' ? (
            <strong>Bugün sınav günü</strong>
          ) : (
            <span>
              Sınava <strong>{daysLabel}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
