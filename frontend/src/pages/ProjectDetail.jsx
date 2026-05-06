import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProject, getTasks, createTask, updateTaskStatus, addMember } from '../services/api';
import Navbar from '../components/Navbar';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  });
  const [creatingTask, setCreatingTask] = useState(false);

  // Member form state
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        getProject(id),
        getTasks(id)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = project?.role === 'Admin' || project?.admin?._id === user?.id;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingTask(true);

    if (!taskForm.title.trim() || !taskForm.assignedTo || !taskForm.dueDate) {
      setError('Title, assignee, and due date are required');
      setCreatingTask(false);
      return;
    }

    try {
      await createTask(id, taskForm.title, taskForm.description, taskForm.assignedTo, taskForm.dueDate);
      setSuccess('Task created successfully!');
      setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '' });
      setShowTaskForm(false);
      fetchProjectAndTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      setSuccess('Task status updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAddingMember(true);

    const normalizedEmail = memberEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Email is required');
      setAddingMember(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email');
      setAddingMember(false);
      return;
    }

    try {
      await addMember(id, normalizedEmail);
      setSuccess('Member added successfully!');
      setMemberEmail('');
      setShowMemberForm(false);
      fetchProjectAndTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'Completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tasksByStatus = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Completed': tasks.filter(t => t.status === 'Completed')
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Project Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{project?.name}</h1>
            <p className="text-gray-600 mb-4">{project?.description || 'No description'}</p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <span className="text-sm text-gray-500">Admin: </span>
                <span className="text-sm font-medium">{project?.admin?.email}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Members: </span>
                <span className="text-sm font-medium">
                  {project?.members?.map(m => `${m.email} (${m.role || 'Member'})`).join(', ') || 'None'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Your role: </span>
                <span className="text-sm font-medium">{project?.role || 'Member'}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Action Buttons */}
          {isAdmin && (
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowMemberForm(!showMemberForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                {showMemberForm ? 'Cancel' : '+ Add Member'}
              </button>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                {showTaskForm ? 'Cancel' : '+ Create Task'}
              </button>
            </div>
          )}

          {/* Add Member Form */}
          {showMemberForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add Member</h2>
              <form onSubmit={handleAddMember} className="flex gap-4">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter member email"
                />
                <button
                  type="submit"
                  disabled={addingMember}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
                >
                  {addingMember ? 'Adding...' : 'Add'}
                </button>
              </form>
            </div>
          )}

          {/* Create Task Form */}
          {showTaskForm && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Assign To *
                    </label>
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select assignee</option>
                      <option value={project?.admin?._id}>{project?.admin?.email} (Admin)</option>
                      {project?.members?.map(member => (
                        <option key={member._id} value={member._id}>{member.email} ({member.role || 'Member'})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creatingTask ? 'Creating...' : 'Create Task'}
                </button>
              </form>
            </div>
          )}

          {/* Task Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    status === 'To Do' ? 'bg-yellow-500' :
                    status === 'In Progress' ? 'bg-purple-500' : 'bg-green-500'
                  }`}></span>
                  {status} ({statusTasks.length})
                </h3>
                <div className="space-y-3">
                  {statusTasks.map(task => (
                    <div key={task._id} className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mb-2">
                        <div>Assigned to: {task.assignedTo?.email}</div>
                        <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                      </div>
                      {isOverdue(task.dueDate, task.status) && (
                        <div className="text-xs text-red-600 font-semibold mb-2">
                           OVERDUE
                        </div>
                      )}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`w-full text-xs px-2 py-1 rounded ${getStatusColor(task.status)} border-0 font-medium`}
                        disabled={!isAdmin && task.assignedTo?._id !== user?.id}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  ))}
                  {statusTasks.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;
