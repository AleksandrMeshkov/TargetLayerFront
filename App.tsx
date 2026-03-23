import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './src/pages/Home.tsx';
import Login from './src/pages/Login.tsx';
import Register from './src/pages/Register.tsx';
import NotFound from './src/pages/NotFound.tsx';
import AppLayout from './src/components/AppLayout.tsx';
import Dashboard from './src/pages/app/Dashboard.tsx';
import AppNotFound from './src/pages/app/AppNotFound.tsx';

function isAuthenticated(): boolean {
  return localStorage.getItem('tl_auth') === '1';
}

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/app" replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <Theme appearance="dark" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-sans selection:bg-purple-500/30">
          <Routes>
            <Route path="/" element={<Home />} />
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
              path="/app"
              element={(
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              )}
            >
              <Route index element={<Dashboard />} />
              <Route path="*" element={<AppNotFound />} />
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
            theme="dark"
          />
        </main>
      </Router>
    </Theme>
  );
}

export default App;