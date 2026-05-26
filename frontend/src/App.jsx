import { useState, useEffect, useCallback } from 'react';
import { getTasks, patchTask, dropTask, getStats } from './api';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import FilterBar from './components/FilterBar';
import StatsPanel from './components/StatsPanel';

export default function App() {
  const [taskRoster, setTaskRoster] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [isBusy, setIsBusy] = useState(true);
  const [apiError, setApiError] = useState('');
  const [activeFilters, setActiveFilters] = useState({ status: 'all', minImportance: 1 });

  const reloadData = useCallback(async () => {
    setIsBusy(true);
    setApiError('');
    try {
      const [items, stats] = await Promise.all([getTasks(activeFilters), getStats()]);
      setTaskRoster(items);
      setDashData(stats);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setIsBusy(false);
    }
  }, [activeFilters]);

  useEffect(() => { reloadData(); }, [reloadData]);

  const refreshStats = () => getStats().then(setDashData).catch(() => {});

  const onTaskCreated = (fresh) => {
    setTaskRoster((prev) =>
      [fresh, ...prev].sort((a, b) => b.priorityScore - a.priorityScore)
    );
    refreshStats();
  };

  const onMarkDone = async (id) => {
    try {
      const patched = await patchTask(id, { status: 'completed' });
      setTaskRoster((prev) =>
        prev.map((t) => (t._id === id ? patched : t))
          .sort((a, b) => b.priorityScore - a.priorityScore)
      );
      refreshStats();
    } catch (e) {
      setApiError(e.message);
    }
  };

  const onRemove = async (id) => {
    if (!window.confirm('Permanently delete this task?')) return;
    try {
      await dropTask(id);
      setTaskRoster((prev) => prev.filter((t) => t._id !== id));
      refreshStats();
    } catch (e) {
      setApiError(e.message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TaskFlow</h1>
        <p>Priority-scored task manager</p>
      </header>

      {dashData && <StatsPanel stats={dashData} />}

      <main className="app-body">
        <aside className="sidebar">
          <h2>Add Task</h2>
          <TaskForm onCreated={onTaskCreated} />
        </aside>

        <section className="task-section">
          <FilterBar filters={activeFilters} onChange={setActiveFilters} />

          {apiError && <div className="banner-error">{apiError}</div>}

          {isBusy ? (
            <div className="state-placeholder">
              <span className="spinner" /> Loading tasks...
            </div>
          ) : taskRoster.length === 0 ? (
            <div className="state-placeholder">No tasks match your current filters.</div>
          ) : (
            <div className="task-list">
              {taskRoster.map((t) => (
                <TaskCard key={t._id} task={t} onComplete={onMarkDone} onDelete={onRemove} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
