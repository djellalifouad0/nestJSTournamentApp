import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-purple-400 after:w-full'
      : 'text-gray-400 hover:text-white after:w-0 hover:after:w-full';

  const navLink = (to: string, label: string, icon: string) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`relative flex items-center gap-2 px-1 py-2 text-sm font-medium transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-purple-500 after:to-cyan-400 after:transition-all after:duration-300 ${isActive(to)}`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 glass border-b border-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              TM
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              TournamentManager
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/', 'Tournaments', '\u{1F3C6}')}
            {navLink('/games', 'Games', '\u{1F3AE}')}
            {navLink('/leaderboard', 'Leaderboard', '\u{1F4CA}')}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={`/players/${user?.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-light hover:bg-surface-lighter transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm text-gray-300">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            {navLink('/', 'Tournaments', '\u{1F3C6}')}
            {navLink('/games', 'Games', '\u{1F3AE}')}
            {navLink('/leaderboard', 'Leaderboard', '\u{1F4CA}')}
            {isAuthenticated ? (
              <>
                <Link
                  to={`/players/${user?.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-1 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Profile
                </Link>
                <button onClick={handleLogout} className="block px-1 py-2 text-sm text-red-400">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-1 py-2 text-sm text-purple-400">
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
