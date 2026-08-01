import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not sign you in. Check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Google sign-in failed. Try again.');
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

        <div className="mb-5 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed. Try again.')}
          />
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-canvas-line" />
          <span className="text-[11px] uppercase tracking-[0.08em] text-body-muted font-mono">or</span>
          <div className="flex-1 h-px bg-canvas-line" />
        </div>

        <form onSubmit={handleSubmit}>
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
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full font-body font-semibold text-sm rounded-card border border-transparent bg-ink text-paper px-[18px] py-2.5 inline-flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 hover:enabled:bg-ink-soft disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-5 text-[13px] text-body-muted text-center">
          New here?{' '}
          <Link to="/signup" className="text-accent font-semibold no-underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;