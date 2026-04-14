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

  const isActive = (path: string) => location.pathname === path;

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`text-xs font-bold uppercase tracking-widest transition-colors ${
        isActive(to) ? 'text-volt' : 'text-smoke hover:text-chalk'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-ink border-b border-ridge">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display font-extrabold text-lg text-volt tracking-tight">
              TM<span className="text-chalk">_</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLink('/', 'Tournaments')}
            {navLink('/games', 'Games')}
            {navLink('/leaderboard', 'Rankings')}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={`/players/${user?.id}`}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-smoke hover:text-volt transition-colors"
                >
                  <span className="w-6 h-6 bg-volt text-ink flex items-center justify-center text-[10px] font-extrabold">
                    {user?.email?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold uppercase tracking-widest text-hot hover:text-chalk transition-colors"
                >
                  Exit
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-smoke hover:text-chalk transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn btn-volt text-[10px] py-1.5 px-4">
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-chalk"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="square" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-4 border-t border-ridge pt-4 anim-fade">
            {navLink('/', 'Tournaments')}
            {navLink('/games', 'Games')}
            {navLink('/leaderboard', 'Rankings')}
            {isAuthenticated ? (
              <>
                <Link to={`/players/${user?.id}`} onClick={() => setMobileOpen(false)}
                  className="text-xs font-bold uppercase tracking-widest text-smoke">Profile</Link>
                <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-hot text-left">Exit</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="text-xs font-bold uppercase tracking-widest text-volt">Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
