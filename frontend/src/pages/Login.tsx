import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      login(res.data.data.access_token);
      toast.success('Authenticated.');
      navigate('/');
    } catch {
      toast.error('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { role: 'ADMIN', email: 'admin@tournament.gg', pw: 'admin123' },
    { role: 'PLAYER', email: 'player@tournament.gg', pw: 'player123' },
    { role: 'VIEWER', email: 'viewer@tournament.gg', pw: 'viewer123' },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* Left - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slab items-center justify-center relative scanlines">
        <div className="text-center px-12">
          <div className="font-display font-extrabold text-[120px] leading-none text-volt tracking-tighter">
            TM
          </div>
          <div className="mt-4 text-smoke text-xs uppercase tracking-[0.3em] font-mono font-bold">
            Tournament Manager
          </div>
          <div className="mt-8 w-24 h-px bg-ridge mx-auto" />
          <div className="mt-8 text-ridge text-xs font-mono max-w-xs mx-auto leading-relaxed">
            Compete. Climb. Conquer.<br />
            The arena awaits.
          </div>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm anim-slide-up">
          <h1 className="font-display font-extrabold text-4xl text-chalk mb-1">
            Sign In<span className="text-volt">.</span>
          </h1>
          <p className="text-smoke text-xs font-mono mb-8">Access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="you@email.com"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-volt w-full disabled:opacity-40">
              {loading ? 'Authenticating...' : 'Enter'}
            </button>
          </form>

          <p className="text-smoke text-xs font-mono mt-6">
            No account?{' '}
            <Link to="/register" className="text-volt hover:underline">Create one</Link>
          </p>

          {/* Test accounts */}
          <div className="mt-10 pt-6 border-t border-ridge">
            <div className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-3">
              Test Accounts
            </div>
            <div className="space-y-1.5">
              {testAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.pw); }}
                  className="w-full flex items-center gap-3 p-2 border border-ridge hover:border-volt transition-colors text-left group"
                >
                  <span className="tag tag-volt">{acc.role}</span>
                  <span className="text-xs text-smoke font-mono flex-1 truncate">{acc.email}</span>
                  <span className="text-[9px] text-ridge group-hover:text-volt transition-colors font-mono">FILL →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
