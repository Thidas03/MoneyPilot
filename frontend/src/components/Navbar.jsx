import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X, Sun, Moon, Mail, Calendar } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isLightPage = theme === 'light';

  const navLinkClass = (path) => {
    if (isLightPage) {
      return `text-sm font-semibold transition-colors px-4 py-2 rounded-full ${
        isActive(path)
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
      }`;
    }
    return `text-sm font-medium transition-colors px-3 py-2 rounded-xl ${
      isActive(path) 
        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
        : 'text-dark-300 hover:text-white hover:bg-white/5'
    }`;
  };

  const mobileNavLinkClass = (path) => {
    if (isLightPage) {
      return `block text-base font-semibold transition-colors px-3 py-2.5 rounded-lg ${
        isActive(path)
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
      }`;
    }
    return `block text-base font-medium transition-colors px-3 py-2.5 rounded-lg ${
      isActive(path) 
        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/10' 
        : 'text-dark-200 hover:text-white hover:bg-white/5'
    }`;
  };

  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${
      isLightPage 
        ? 'bg-white/70 border-b border-slate-100' 
        : 'glass-panel border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Branding Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img 
                src={logoImg} 
                alt="MoneyPilot Logo" 
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                Money<span className="text-emerald-600 font-bold">Pilot</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/budgets" className={navLinkClass('/budgets')}>
                  Budgets
                </Link>
                <Link to="/goals" className={navLinkClass('/goals')}>
                  Goals
                </Link>
                <Link to="/reports" className={navLinkClass('/reports')}>
                  Reports
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Controls / User Dropdown */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all ${
                isLightPage
                  ? 'border-slate-200 bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  : 'border-white/10 bg-white/5 text-dark-200 hover:bg-white/10 hover:text-white'
              }`}
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                    isLightPage
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-400'
                      : 'border-brand-500/30 bg-brand-500/10 text-brand-400 hover:border-brand-400'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-semibold transition-colors ${
                    isLightPage ? 'text-slate-700 hover:text-slate-900' : 'text-dark-200 hover:text-white'
                  }`}>
                    {user.name}
                  </span>
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    ></div>
                    <div className={`absolute right-0 mt-2 w-72 rounded-2xl p-4 shadow-2xl z-20 border animate-slide-up ${
                      isLightPage
                        ? 'bg-white border-slate-100 text-slate-800'
                        : 'glass-panel border-white/10 text-white'
                    }`}>
                      {/* Avatar and Name */}
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100/50 dark:border-white/5">
                        <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 ${
                          isLightPage
                            ? 'border-emerald-250 bg-emerald-50 text-emerald-600'
                            : 'border-brand-500/20 bg-brand-500/10 text-brand-400'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{user.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                            Pilot
                          </span>
                        </div>
                      </div>

                      {/* Profile details */}
                      <div className="py-3.5 space-y-2.5 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pilot ID</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">{user._id}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
                            <span className="font-semibold truncate block">{user.email}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Registered At</span>
                            <span className="font-semibold">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Log Out button */}
                      <div className="pt-2 border-t border-slate-100/50 dark:border-white/5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-sm font-semibold transition-colors px-3 py-2 ${
                    isLightPage ? 'text-slate-600 hover:text-slate-950' : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md shadow-emerald-500/10 transition-all active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-full border transition-all ${
                isLightPage
                  ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  : 'border-white/10 bg-white/5 text-dark-200 hover:bg-white/10'
              }`}
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg focus:outline-none ${
                isLightPage ? 'text-slate-600 hover:text-slate-900' : 'text-dark-400 hover:text-white'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden border-t animate-fade-in ${
          isLightPage ? 'border-slate-100' : 'border-white/5'
        }`}>
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-lg ${
            isLightPage ? 'bg-white/95' : 'bg-dark-900/90'
          }`}>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/budgets" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/budgets')}>
                  Budgets
                </Link>
                <Link to="/goals" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/goals')}>
                  Goals
                </Link>
                <Link to="/reports" onClick={() => setIsOpen(false)} className={mobileNavLinkClass('/reports')}>
                  Reports
                </Link>
                <div className={`px-4 py-3 border-t mt-2 flex items-center gap-3 ${
                  isLightPage ? 'border-slate-50' : 'border-white/5'
                }`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${
                    isLightPage
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${isLightPage ? 'text-slate-800' : 'text-white'}`}>{user.name}</h4>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-base font-semibold text-red-500 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </>
            ) : (
              <div className={`space-y-2 p-2 border-t mt-2 ${
                isLightPage ? 'border-slate-100' : 'border-white/5'
              }`}>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`block text-center px-3 py-2 rounded-lg text-base font-semibold transition-colors ${
                    isLightPage ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-dark-200 hover:text-white'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full text-base font-bold shadow-md transition-all"
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
