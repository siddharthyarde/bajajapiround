const Task = require('../models/Task');
const { scoreTask, attachScore } = require('../utils/scoring');

const EDITABLE = ['title', 'description', 'importance', 'dueDate', 'status'];

function checkFields(body, creating) {
  const { title, importance, dueDate, description, status } = body;

  if (creating || title !== undefined) {
    if (!title || !String(title).trim())
      return 'title is required';
    const t = String(title).trim();
    if (t.length < 3) return 'title must be at least 3 characters';
    if (t.length > 100) return 'title cannot exceed 100 characters';
  }

  if (creating || importance !== undefined) {
    if (creating && (importance === undefined || importance === ''))
      return 'importance is required';
    if (importance !== undefined && importance !== '') {
      const n = Number(importance);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 5)
        return 'importance must be a whole number between 1 and 5';
    }
  }

  if (creating || dueDate !== undefined) {
    if (creating && !dueDate) return 'dueDate is required';
    if (dueDate) {
      const d = new Date(dueDate);
      if (isNaN(d.getTime())) return 'dueDate is not a recognisable date';
      if (creating && d <= new Date()) return 'dueDate must be set in the future';
    }
  }

  if (description !== undefined && String(description).length > 500)
    return 'description may not exceed 500 characters';

  if (status !== undefined && !['pending', 'completed'].includes(status))
    return 'status must be either pending or completed';

  return null;
}

function hexId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

async function browseTasks(req, res, next) {
  try {
    const filter = {};

    if (req.query.status !== undefined) {
      if (!['pending', 'completed'].includes(req.query.status))
        return res.status(400).json({ error: 'status query must be pending or completed' });
      filter.status = req.query.status;
    }

    if (req.query.minImportance !== undefined) {
      const floor = Number(req.query.minImportance);
      if (!Number.isFinite(floor) || floor < 1 || floor > 5)
        return res.status(400).json({ error: 'minImportance must be between 1 and 5' });
      filter.importance = { $gte: floor };
    }

    const rows = await Task.find(filter).lean();
    const ranked = rows
      .map(t => ({ ...t, priorityScore: scoreTask(t.importance, t.dueDate, t.status) }))
      .sort((a, b) => b.priorityScore - a.priorityScore);

    res.json(ranked);
  } catch (err) {
    next(err);
  }
}

async function addTask(req, res, next) {
  try {
    const issue = checkFields(req.body, true);
    if (issue) return res.status(400).json({ error: issue });

    const { title, description, importance, dueDate } = req.body;

    const saved = await Task.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      importance: Number(importance),
      dueDate: new Date(dueDate),
    });

    res.status(201).json(attachScore(saved));
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0]?.message });
    }
    next(err);
  }
}

async function editTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!hexId(id)) return res.status(400).json({ error: 'Task ID is not valid' });

    const issue = checkFields(req.body, false);
    if (issue) return res.status(400).json({ error: issue });

    const patch = {};
    for (const key of EDITABLE) {
      if (req.body[key] === undefined) continue;
      if (key === 'importance') patch[key] = Number(req.body[key]);
      else if (key === 'title') patch[key] = String(req.body[key]).trim();
      else if (key === 'description') patch[key] = String(req.body[key]).trim();
      else patch[key] = req.body[key];
    }

    if (!Object.keys(patch).length)
      return res.status(400).json({ error: 'No updatable fields were provided' });

    const updated = await Task.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'No task found with that ID' });

    res.json(attachScore(updated));
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors)[0]?.message });
    }
    next(err);
  }
}

async function eraseTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!hexId(id)) return res.status(400).json({ error: 'Task ID is not valid' });

    const gone = await Task.findByIdAndDelete(id);
    if (!gone) return res.status(404).json({ error: 'No task found with that ID' });

    res.json({ message: 'Task removed', id });
  } catch (err) {
    next(err);
  }
}

async function fetchAggregates(req, res, next) {
  try {
    const now = new Date();

    const [result] = await Task.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                averageImportance: { $avg: '$importance' },
                overdueTasks: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ['$status', 'pending'] }, { $lt: ['$dueDate', now] }] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          byLevel: [
            { $group: { _id: '$importance', cnt: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const base = result.totals[0] || {
      totalTasks: 0, pendingTasks: 0, completedTasks: 0,
      averageImportance: 0, overdueTasks: 0,
    };

    const tasksByImportance = {};
    for (const row of result.byLevel) {
      tasksByImportance[String(row._id)] = row.cnt;
    }

    res.json({
      totalTasks: base.totalTasks,
      pendingTasks: base.pendingTasks,
      completedTasks: base.completedTasks,
      averageImportance: base.averageImportance
        ? parseFloat(base.averageImportance.toFixed(2))
        : 0,
      overdueTasks: base.overdueTasks,
      tasksByImportance,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { browseTasks, addTask, editTask, eraseTask, fetchAggregates };
