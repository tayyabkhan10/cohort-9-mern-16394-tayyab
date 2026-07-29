
import { useNavigate } from 'react-router-dom';
import Spine from '../components/Spine';
import { useAuth } from '../context/AuthContext';

const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex stack:flex-col min-h-screen">
      <Spine />
      <main className="flex-1 min-w-0 px-12 stack:px-5 pt-10 stack:pt-6 pb-16 stack:pb-12">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-7">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-body-muted mb-1.5">Account</div>
            <h1 className="text-[32px]">Profile</h1>
          </div>
        </div>

        {user && (
          <div className="max-w-[420px] bg-canvas border border-canvas-line rounded-card p-7">
            <div className="flex justify-between py-3 border-b border-canvas-line text-sm">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">Name</span>
              <span>{user.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-canvas-line text-sm">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-muted">
                Member since
              </span>
              <span>{formatDate(user.created_at)}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="font-body font-semibold text-sm rounded-card border border-transparent bg-danger-soft text-danger px-[18px] py-2.5 inline-flex items-center gap-2 cursor-pointer transition-colors duration-150 hover:bg-danger-hover mt-6"
          onClick={handleLogout}
        >
          Log out
        </button>
      </main>
    </div>
  );
};

export default Profile;