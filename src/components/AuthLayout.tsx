import React from 'react';
import { motion } from 'framer-motion';
import MouseFollower from './MouseFollower';
import brainRaspberry from '../assets/brain-raspberry.svg';
import Logo from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="theme-shell relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <MouseFollower />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="mb-4 h-16 w-16 overflow-hidden rounded-2xl border border-[rgb(var(--border-color))] shadow-lg shadow-purple-500/20">
            <img src={brainRaspberry} alt="Логотип" className="w-full h-full object-cover" />
          </div>
          <h1 className="theme-heading text-2xl font-bold tracking-tight sm:text-3xl">
            <Logo showIcon={false} />
          </h1>
        </div>

        <div className="theme-panel-strong rounded-3xl p-8">
          <div className="mb-8">
            <h2 className="theme-heading mb-2 text-2xl font-semibold">{title}</h2>
            <p className="theme-muted text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;