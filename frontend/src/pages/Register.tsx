import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register({ username, email, password });
      toast.success('Account created.');
      navigate('/login');
    } catch {
      toast.error('Username or email already taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 bg-slab items-center justify-center relative scanlines">
        <div className="text-center px-12">
          <div className="font-display font-extrabold text-[120px] leading-none text-ice tracking-tighter">
            +1
          </div>
          <div className="mt-4 text-smoke text-xs uppercase tracking-[0.3em] font-mono font-bold">
            New Challenger
          </div>
          <div className="mt-8 w-24 h-px bg-ridge mx-auto" />
          <div className="mt-8 text-ridge text-xs font-mono max-w-xs mx-auto leading-relaxed">
            Join the tournament.<br />
            Prove your worth.
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm anim-slide-up">
          <h1 className="font-display font-extrabold text-4xl text-chalk mb-1">
            Join<span className="text-ice">.</span>
          </h1>
          <p className="text-smoke text-xs font-mono mb-8">Create your fighter profile</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1.5 block">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full" placeholder="YourTag" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full" placeholder="you@email.com" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-smoke mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full" placeholder="min. 6 chars" minLength={6} required />
            </div>
            <button type="submit" disabled={loading}
              className="btn w-full bg-ice text-ink border-ice hover:bg-ink hover:text-ice font-bold disabled:opacity-40">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-smoke text-xs font-mono mt-6">
            Have an account?{' '}
            <Link to="/login" className="text-ice hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
