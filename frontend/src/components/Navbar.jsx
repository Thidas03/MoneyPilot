import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User, Menu, X, TrendingUp } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Branding Logo */}
          <div className="flex items-center">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
              <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg group-hover:bg-brand-500/20 transition-all duration-300">
                <Compass className="w-6 h-6 animate-spin-slow group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-dark-100 to-brand-400 bg-clip-text text-transparent">
                Money<span className="text-brand-400">Pilot</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-dark-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full border border-brand-500/30 flex items-center justify-center bg-brand-500/10 text-brand-400 hover:border-brand-400 transition-all">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-dark-200 text-sm font-medium hover:text-white transition-colors">
                      {user.name}
                    </span>
                  </button>

                  {showDropdown && (
                    <>
                      {/* Overlay to close on outside click */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel py-1 shadow-2xl z-20 border border-white/10 animate-slide-up">
                        <div className="px-4 py-2 border-b border-white/5">
                          <p className="text-xs text-dark-400">Logged in as</p>
                          <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-dark-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-dark-400 hover:text-white p-2 rounded-lg focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-900/90 backdrop-blur-lg">
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-brand-500/10 text-brand-400 border border-brand-500/30 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{user.name}</h4>
                    <p className="text-xs text-dark-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block text-dark-200 hover:text-white px-3 py-2.5 rounded-lg text-base font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-base font-medium text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="space-y-2 p-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-dark-200 hover:text-white px-3 py-2 rounded-lg text-base font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-base font-semibold shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
