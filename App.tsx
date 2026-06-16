import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './src/pages/Home.tsx';
import Login from './src/pages/Login.tsx';
import Register from './src/pages/Register.tsx';
import ForgotPassword from './src/pages/ForgotPassword.tsx';
import ResetPassword from './src/pages/ResetPassword.tsx';
import NotFound from './src/pages/NotFound.tsx';
import AppLayout from './src/components/AppLayout.tsx';
import Chat from './src/pages/app/Chat.tsx';
import ChatForUser from './src/pages/app/ChatForUser.tsx';
import Roadmaps from './src/pages/app/Roadmaps.tsx';
import Teams from './src/pages/app/Teams.tsx';
import TeamView from './src/pages/app/TeamView.tsx';
import Profile from './src/pages/app/Profile.tsx';
import Search from './src/pages/app/Search.tsx';
import ChangePassword from './src/pages/app/ChangePassword.tsx';
import { isAuthenticatedSession } from './src/api/auth/session.ts';
import { ThemeModeProvider, useThemeMode } from './src/hooks/themeHooks/useThemeMode';

function isAuthenticated(): boolean {
  return isAuthenticatedSession();
}

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/app/profile" replace />;
  }
  return children;
};

const AppContent: React.FC = () => {
  const { themeMode } = useThemeMode();

  return (
    <Theme appearance={themeMode} radius="large" scaling="100%">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <main className="theme-shell font-sans selection:bg-purple-500/30">
          <Routes>
            <Route
              path="/"
              element={(
                <PublicOnlyRoute>
                  <Home />
                </PublicOnlyRoute>
              )}
            />
            <Route
              path="/login"
              element={(
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              )}
            />
            <Route
              path="/register"
              element={(
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              )}
            />

            <Route
              path="/forgot-password"
              element={(
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              )}
            />

            <Route
              path="/reset-password"
              element={(
                <PublicOnlyRoute>
                  <ResetPassword />
                </PublicOnlyRoute>
              )}
            />

            <Route
              path="/app"
              element={(
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="chat" element={<Chat />} />
              <Route path="chats" element={<ChatForUser />} />
              <Route path="roadmaps" element={<Roadmaps />} />
              <Route path="teams" element={<Teams />} />
              <Route path="teams/:teamId" element={<TeamView />} />
              <Route path="search" element={<Search />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={themeMode}
          />
        </main>
      </Router>
    </Theme>
  );
};

const App: React.FC = () => (
  <ThemeModeProvider>
    <AppContent />
  </ThemeModeProvider>
);

export default App;