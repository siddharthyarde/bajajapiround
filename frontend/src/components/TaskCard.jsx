function importanceDots(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function deadlineText(dueDate) {
  const msLeft = new Date(dueDate).getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / 86_400_000);
  if (daysLeft < 0) return { label: `${Math.abs(daysLeft)}d overdue`, overdue: true };
  if (daysLeft === 0) return { label: 'Due today', overdue: false };
  if (daysLeft === 1) return { label: 'Due tomorrow', overdue: false };
  return { label: `${daysLeft} days left`, overdue: false };
}

function niceDate(raw) {
  return new Date(raw).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function TaskCard({ task, onComplete, onDelete }) {
  const highPriority = task.priorityScore >= 50;
  const { label, overdue } = deadlineText(task.dueDate);

  const cardClass = [
    'task-card',
    highPriority ? 'is-urgent' : '',
    task.status === 'completed' ? 'is-done' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className="card-top">
        <div className="card-text">
          <h3 className="card-title">{task.title}</h3>
          {task.description && <p className="card-desc">{task.description}</p>}
        </div>
        <span className={`score-tag${highPriority ? ' urgent' : ''}`}>
          {highPriority && <span className="hp-dot">●</span>}
          Score: {task.priorityScore}
        </span>
      </div>

      <div className="card-meta">
        <span className="stars" title={`Importance: ${task.importance} / 5`}>
          {importanceDots(task.importance)}
        </span>
        <span className={`due-label${overdue ? ' past-due' : ''}`}>
          {label} · {niceDate(task.dueDate)}
        </span>
        <span className={`status-pill ${task.status}`}>{task.status}</span>
      </div>

      <div className="card-actions">
        {task.status === 'pending' && (
          <button className="btn-complete" onClick={() => onComplete(task._id)}>
            Mark Complete
          </button>
        )}
        <button className="btn-delete" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
