import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold">
              Team Task Manager
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className="hover:bg-blue-700 px-3 py-2 rounded-md transition"
              >
                Dashboard
              </Link>
              <Link
                to="/projects"
                className="hover:bg-blue-700 px-3 py-2 rounded-md transition"
              >
                Projects
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
