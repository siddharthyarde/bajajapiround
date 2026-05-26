export default function FilterBar({ filters, onChange }) {
  const update = (key) => (e) => {
    const val = key === 'minImportance' ? Number(e.target.value) : e.target.value;
    onChange((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Status</label>
        <select value={filters.status} onChange={update('status')}>
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Min Importance: {filters.minImportance}/5</label>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={filters.minImportance}
          onChange={update('minImportance')}
        />
      </div>
    </div>
  );
}
