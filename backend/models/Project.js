const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    required: true
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name must be at most 100 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  team: {
    type: [teamMemberSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
projectSchema.index({ admin: 1 });
projectSchema.index({ members: 1 });
projectSchema.index({ 'team.user': 1 });

// Method to check if user is admin
projectSchema.methods.isAdmin = function(userId) {
  const id = userId.toString();
  return this.admin.toString() === id || this.team.some(member => {
    const memberId = member.user?._id || member.user;
    return member.role === 'Admin' && memberId.toString() === id;
  });
};

// Method to check if user is a member
projectSchema.methods.isMember = function(userId) {
  const id = userId.toString();
  return this.members.some(member => member.toString() === id) || this.team.some(member => {
    const memberId = member.user?._id || member.user;
    return member.role === 'Member' && memberId.toString() === id;
  });
};

// Method to check if user has access (admin or member)
projectSchema.methods.hasAccess = function(userId) {
  return this.isAdmin(userId) || this.isMember(userId);
};

// Method to get user's project role
projectSchema.methods.getRole = function(userId) {
  if (this.isAdmin(userId)) {
    return 'Admin';
  }

  if (this.isMember(userId)) {
    return 'Member';
  }

  return null;
};

// Pre-save hook to update timestamp
projectSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Project', projectSchema);
