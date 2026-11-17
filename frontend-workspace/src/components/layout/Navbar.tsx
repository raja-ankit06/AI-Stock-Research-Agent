import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, LogOut, Moon, Sun, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-[#1F293D] bg-[#111827] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-base tracking-tight text-white hidden sm:inline">
            StockAnalyst <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">AI</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          MARKETS LIVE (NYSE / NSE)
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition"
            >
              <UserIcon className="w-4 h-4 text-gray-400" />
              <span className="hidden sm:inline">{user.full_name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded transition font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition font-medium shadow-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

