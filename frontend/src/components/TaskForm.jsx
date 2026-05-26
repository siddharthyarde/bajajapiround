import { useState } from 'react';
import { createTask } from '../api';

const INIT = { title: '', description: '', importance: 3, dueDate: '' };

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function validateForm(vals) {
  const t = vals.title.trim();
  if (!t) return 'Title is required';
  if (t.length < 3) return 'Title needs at least 3 characters';
  if (t.length > 100) return 'Title cannot exceed 100 characters';
  if (!vals.dueDate) return 'Please pick a due date';
  if (new Date(vals.dueDate) <= new Date()) return 'Due date must be in the future';
  if (vals.description.length > 500) return 'Description is too long (max 500 chars)';
  return null;
}

export default function TaskForm({ onCreated }) {
  const [vals, setVals] = useState(INIT);
  const [sending, setSending] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const patch = (key) => (e) => setVals((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const problem = validateForm(vals);
    if (problem) { setErrMsg(problem); return; }

    setSending(true);
    setErrMsg('');
    try {
      const result = await createTask({
        title: vals.title.trim(),
        description: vals.description.trim(),
        importance: Number(vals.importance),
        dueDate: vals.dueDate,
      });
      onCreated(result);
      setVals(INIT);
    } catch (e) {
      setErrMsg(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="task-form" onSubmit={submit}>
      {errMsg && <div className="form-err">{errMsg}</div>}

      <div className="field">
        <label>Title *</label>
        <input
          type="text"
          value={vals.title}
          onChange={patch('title')}
          placeholder="What needs to be done?"
          maxLength={100}
        />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          value={vals.description}
          onChange={patch('description')}
          placeholder="Optional details..."
          rows={2}
          maxLength={500}
        />
      </div>

      <div className="two-col">
        <div className="field">
          <label>Importance: {vals.importance} / 5</label>
          <input
            type="range" min="1" max="5" step="1"
            value={vals.importance}
            onChange={patch('importance')}
          />
          <div className="range-ends"><span>Low</span><span>Critical</span></div>
        </div>
        <div className="field">
          <label>Due Date *</label>
          <input
            type="date"
            value={vals.dueDate}
            onChange={patch('dueDate')}
            min={tomorrowStr()}
          />
        </div>
      </div>

      <button type="submit" disabled={sending} className="btn-primary">
        {sending ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
