export default function StatsPanel({ stats }) {
  const { totalTasks, pendingTasks, completedTasks, averageImportance, overdueTasks, tasksByImportance } = stats;

  return (
    <div className="stats-panel">
      <h2>Overview</h2>
      <div className="stats-row">
        <div className="stat-chip">
          <span className="stat-num">{totalTasks}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-chip is-pending">
          <span className="stat-num">{pendingTasks}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-chip is-done">
          <span className="stat-num">{completedTasks}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-chip is-overdue">
          <span className="stat-num">{overdueTasks}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-chip">
          <span className="stat-num">{averageImportance}</span>
          <span className="stat-label">Avg Importance</span>
        </div>
      </div>

      {tasksByImportance && Object.keys(tasksByImportance).length > 0 && (
        <div className="importance-breakdown">
          <span>By importance:</span>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <span key={lvl} className="imp-chip">
              {'★'.repeat(lvl)} {tasksByImportance[String(lvl)] ?? 0}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
