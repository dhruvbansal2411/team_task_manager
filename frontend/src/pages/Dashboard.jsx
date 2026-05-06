import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getProjects, getTasks } from '../services/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        getDashboardStats(),
        getProjects()
      ]);

      setStats(statsRes.data);

      const taskResponses = await Promise.all(
        projectsRes.data.map(project => getTasks(project._id))
      );

      const allTasks = taskResponses
        .flatMap(response => response.data)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentTasks(allTasks);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'To Do':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-200';
    }
  };

  const activeTasks = stats ? stats.todoTasks + stats.inProgressTasks : 0;
  const activeTaskLabel = activeTasks === 1 ? 'active task' : 'active tasks';

  const statCards = stats ? [
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6M9 9h6m-7 4h8m-9 4h10M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
    },
    {
      label: 'To Do',
      value: stats.todoTasks,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    },
    {
      label: 'Completed',
      value: stats.completedTasks,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M10.3 3.9L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
    }
  ] : [];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                Welcome, {user?.email}
              </h1>
              <p className="mt-3 text-base text-slate-600">
                {activeTasks > 0
                  ? `You have ${activeTasks} ${activeTaskLabel}. Stay productive `
                  : 'No active tasks right now. Ready to plan the next win?'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/projects')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Project
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-6 4h6m-6 4h4m-6 8h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Create Task
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {stats && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {statCards.map(card => (
                  <div
                    key={card.label}
                    className={`rounded-xl border ${card.border} bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{card.label}</p>
                        <p className={`mt-3 text-3xl font-bold ${card.color}`}>{card.value}</p>
                      </div>
                      <div className={`rounded-lg ${card.bg} p-3 ${card.color}`}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {card.icon}
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Recent Tasks</h2>
                      <p className="mt-1 text-sm text-slate-500">Latest activity across your projects</p>
                    </div>
                    <button
                      onClick={() => navigate('/projects')}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      View all
                    </button>
                  </div>

                  {recentTasks.length > 0 ? (
                    <div className="space-y-3">
                      {recentTasks.map(task => (
                        <div
                          key={task._id}
                          className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-blue-100 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">{task.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                      <div>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <p className="font-semibold text-slate-800">No activity yet. Create your first task </p>
                        <p className="mt-2 text-sm text-slate-500">Create a project, add members, and start assigning work.</p>
                      </div>
                    </div>
                  )}
                </section>

                <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">Focus</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Keep work moving by updating active task statuses and checking overdue items first.
                  </p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-900">Active workload</p>
                      <p className="mt-2 text-2xl font-bold text-blue-700">{activeTasks}</p>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-4">
                      <p className="text-sm font-semibold text-rose-900">Needs attention</p>
                      <p className="mt-2 text-2xl font-bold text-rose-700">{stats.overdueTasks}</p>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
