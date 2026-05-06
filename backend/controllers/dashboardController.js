const Task = require('../models/Task');

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    // Find all tasks assigned to current user
    const tasks = await Task.find({ assignedTo: req.user.id });
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(task => task.status === 'To Do').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    
    // Calculate overdue tasks (past due date and not completed)
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      return task.dueDate < now && task.status !== 'Completed';
    }).length;
    
    res.status(200).json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = { getStats };
