const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(target) {
  const gap = new Date(target).getTime() - Date.now();
  return Math.floor(gap / ONE_DAY_MS);
}

function urgencyBoost(dueDate) {
  const ahead = daysFromNow(dueDate);
  return 100 / Math.max(ahead, 1);
}

function scoreTask(importance, dueDate, status) {
  if (status === 'completed') return 0;
  const raw = importance * 10 + urgencyBoost(dueDate);
  return parseFloat(raw.toFixed(2));
}

function attachScore(doc) {
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  plain.priorityScore = scoreTask(plain.importance, plain.dueDate, plain.status);
  return plain;
}

module.exports = { scoreTask, attachScore };
