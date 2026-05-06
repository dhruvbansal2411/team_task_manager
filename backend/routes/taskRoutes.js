const express = require('express');
const {
  createTask,
  getTasksByProject,
  updateTaskStatus
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/tasks - Create new task
router.post('/', createTask);

// GET /api/tasks/project/:projectId - Get tasks by project
router.get('/project/:projectId', getTasksByProject);

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', updateTaskStatus);

module.exports = router;
