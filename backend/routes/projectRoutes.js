const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  addMember
} = require('../controllers/projectController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/projects - Create new project
router.post('/', createProject);

// GET /api/projects - Get all user's projects
router.get('/', getProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', getProjectById);

// POST /api/projects/:id/members - Add member to project
router.post('/:id/members', addMember);

module.exports = router;
