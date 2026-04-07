import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, MessageCircle, Map, Menu, Search, Shield, UserRound, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { clearAuthSession, logoutUser } from '../api/auth';
import brainRaspberry from '../assets/brain-raspberry.svg';

export type AppLayoutOutletContext = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

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

  const navItems = [
    { label: 'Профиль', href: '/app/profile', icon: UserRound },
    { label: 'Команды', href: '/app/teams', icon: Shield },
    { label: 'Поиск пользователей', href: '/app/search', icon: Search },
    { label: 'АИ чат', href: '/app/chat', icon: MessageCircle },
    { label: 'Роудмапы', href: '/app/roadmaps', icon: Map },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isTeamWorkspaceRoute = location.pathname.startsWith('/app/teams/');
  const handleNavItemClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080512] text-white flex flex-col">
      <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-purple-200 hover:bg-white/10 transition-colors"
              aria-label="Переключить меню"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/app" className="flex items-center gap-2">
              <img src={brainRaspberry} alt="Иконка мозга" className="h-6 w-6 object-contain" />
              <span className="font-serif text-lg font-bold">TargetLayer</span>
            </Link>
          </div>

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

      <div className="flex flex-1">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl pt-20 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavItemClick}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                      : 'text-purple-100/70 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main
          className={`flex flex-1 min-h-0 flex-col transition-[margin] duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}
        >
          <div
            className={isTeamWorkspaceRoute
              ? 'flex min-h-0 flex-1 flex-col w-full px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4'
              : 'mx-auto flex min-h-0 flex-1 flex-col w-full max-w-7xl px-6 py-10'}
          >
            <Outlet context={{ sidebarOpen, setSidebarOpen }} />
          </div>
        </main>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AppLayout;
