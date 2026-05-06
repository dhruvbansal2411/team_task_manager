const Project = require('../models/Project');
const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatProject = (project, currentUserId) => {
  const data = project.toObject();
  const teamMembers = data.team || [];
  const memberMap = new Map();

  teamMembers
    .filter(member => member.role === 'Member' && member.user)
    .forEach(member => {
      const user = member.user;
      memberMap.set(user._id.toString(), {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'Member'
      });
    });

  (data.members || []).forEach(member => {
    memberMap.set(member._id.toString(), {
      _id: member._id,
      name: member.name,
      email: member.email,
      role: 'Member'
    });
  });

  return {
    ...data,
    role: project.getRole(currentUserId),
    team: teamMembers.map(member => ({
      user: member.user,
      role: member.role
    })),
    members: Array.from(memberMap.values())
  };
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const trimmedName = name?.trim();
    const trimmedDescription = description?.trim() || '';
    
    // Validate input
    if (!trimmedName) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    if (trimmedName.length > 100) {
      return res.status(400).json({ error: 'Project name must be at most 100 characters' });
    }
    
    // Create project with current user as admin
    const project = await Project.create({
      name: trimmedName,
      description: trimmedDescription,
      admin: req.user.id,
      members: [],
      team: [{ user: req.user.id, role: 'Admin' }]
    });
    
    // Populate admin details
    await project.populate('admin', 'name email');
    await project.populate('team.user', 'name email');
    
    res.status(201).json(formatProject(project, req.user.id));
  } catch (error) {
    console.error('Create project error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Get all projects where user is admin or member
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { admin: req.user.id },
        { members: req.user.id },
        { 'team.user': req.user.id }
      ]
    })
    .populate('admin', 'name email')
    .populate('members', 'name email')
    .populate('team.user', 'name email')
    .sort({ createdAt: -1 });
    
    res.status(200).json(projects.map(project => formatProject(project, req.user.id)));
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .populate('team.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access
    if (!project.hasAccess(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.status(200).json(formatProject(project, req.user.id));
  } catch (error) {
    console.error('Get project error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Find project
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is admin
    if (!project.isAdmin(req.user.id)) {
      return res.status(403).json({ error: 'Only project admin can add members' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found with this email' });
    }
    
    // Check if user is already admin
    if (project.isAdmin(user._id)) {
      return res.status(400).json({ error: 'Admin is already part of the project' });
    }
    
    // Check if user is already a member
    if (project.isMember(user._id)) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }
    
    // Add user to explicit role list and legacy member list for compatibility
    project.team.push({ user: user._id, role: 'Member' });
    project.members.push(user._id);
    await project.save();
    
    // Populate and return updated project
    await project.populate('admin', 'name email');
    await project.populate('members', 'name email');
    await project.populate('team.user', 'name email');
    
    res.status(200).json({
      message: 'Member added successfully',
      project: formatProject(project, req.user.id)
    });
  } catch (error) {
    console.error('Add member error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    res.status(500).json({ error: 'Failed to add member' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMember
};
