import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bot, LogOut, MessageCircle, Map, Menu, Search, Shield, UserRound, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { logoutUser } from '../api/auth/client';
import { clearAuthSession } from '../api/auth/session';
import Logo from './Logo';

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
    { label: 'Сообщения', href: '/app/chats', icon: MessageCircle },
    { label: 'ИИ-помощник', href: '/app/chat', icon: Bot },
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
    <div className="theme-shell flex flex-col">
      <header className="theme-panel-strong relative z-50 border-b">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="theme-button-secondary p-2"
              aria-label="Переключить меню"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/app/profile" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="theme-button-secondary"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`theme-panel-strong fixed inset-y-0 left-0 z-40 w-64 border-r pt-20 transition-transform duration-300 ease-in-out ${
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
                  className={`theme-nav-link ${active ? 'theme-nav-link-active' : ''}`}
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
              : 'flex min-h-0 flex-1 flex-col w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10'}
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
