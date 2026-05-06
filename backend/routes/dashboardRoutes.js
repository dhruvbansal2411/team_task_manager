const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', getStats);

module.exports = router;
