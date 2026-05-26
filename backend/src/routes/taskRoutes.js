const { Router } = require('express');
const ctrl = require('../controllers/taskController');

const router = Router();

router.get('/tasks/stats', ctrl.fetchAggregates);
router.get('/tasks', ctrl.browseTasks);
router.post('/tasks', ctrl.addTask);
router.patch('/tasks/:id', ctrl.editTask);
router.delete('/tasks/:id', ctrl.eraseTask);

module.exports = router;
