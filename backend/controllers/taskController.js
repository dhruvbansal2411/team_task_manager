const Task = require('../models/Task');
const Project = require('../models/Project');

// Create new task
const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignedTo, dueDate } = req.body;
    const trimmedTitle = title?.trim();
    const trimmedDescription = description?.trim() || '';
    const parsedDueDate = new Date(dueDate);
    
    // Validate required fields
    if (!projectId || !trimmedTitle || !assignedTo || !dueDate) {
      return res.status(400).json({ error: 'Project, title, assignee, and due date are required' });
    }
    
    if (trimmedTitle.length > 200) {
      return res.status(400).json({ error: 'Task title must be at most 200 characters' });
    }

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ error: 'Due date must be a valid date' });
    }
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is admin
    if (!project.isAdmin(req.user.id)) {
      return res.status(403).json({ error: 'Only project admin can create tasks' });
    }
    
    // Validate assignee is admin or member
    const isValidAssignee = project.isAdmin(assignedTo) || project.isMember(assignedTo);
    
    if (!isValidAssignee) {
      return res.status(400).json({ error: 'Assignee must be admin or member of the project' });
    }
    
    // Create task
    const task = await Task.create({
      title: trimmedTitle,
      description: trimmedDescription,
      project: projectId,
      assignedTo,
      createdBy: req.user.id,
      dueDate: parsedDueDate,
      status: 'To Do'
    });
    
    // Populate fields
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Get tasks by project
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access
    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Find all tasks for project
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['To Do', 'In Progress', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: To Do, In Progress, or Completed' });
    }
    
    // Find task
    const task = await Task.findById(id).populate('project');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user is assignee or project admin
    const isAssignee = task.assignedTo.toString() === req.user.id;
    const isAdmin = task.project.isAdmin(req.user.id);
    
    if (!isAssignee && !isAdmin) {
      return res.status(403).json({ error: 'Only task assignee or project admin can update status' });
    }
    
    // Update status
    task.status = status;
    await task.save();
    
    // Populate and return
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Update task status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus
};
