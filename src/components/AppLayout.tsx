import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Target, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { clearAuthSession, logoutUser } from '../api/auth';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    } finally {
      clearAuthSession();
      toast.success('Вы вышли из аккаунта');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#080512] text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/app" className="flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-400" />
            <span className="font-serif text-lg font-bold">TargetLayer</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-purple-100 transition-colors hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
