


import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not create your account. Try a different email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-[380px] bg-paper border border-canvas-line rounded-card px-9 py-10 shadow-card">
        <div className="font-display text-[22px] font-bold text-ink mb-1">Marginalia</div>
        <div className="font-mono text-xs text-body-muted mb-7">Notes worth keeping</div>
        {error && (
          <div className="bg-danger-soft text-danger text-[13px] px-3 py-2.5 rounded-card mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 mb-[18px]">
            <label htmlFor="name" className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="border border-canvas-line bg-paper rounded-card px-[13px] py-[11px] text-[15px] text-body focus:outline-none focus:border-accent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-[18px]">
            <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="border border-canvas-line bg-paper rounded-card px-[13px] py-[11px] text-[15px] text-body focus:outline-none focus:border-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-[18px]">
            <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="border border-canvas-line bg-paper rounded-card px-[13px] py-[11px] text-[15px] text-body focus:outline-none focus:border-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full font-body font-semibold text-sm rounded-card border border-transparent bg-ink text-paper px-[18px] py-2.5 inline-flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 hover:enabled:bg-ink-soft disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div className="mt-5 text-[13px] text-body-muted text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-semibold no-underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;