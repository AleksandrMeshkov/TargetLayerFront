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
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <MouseFollower />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 mb-4 border border-purple-400/30">
            <img src={brainRaspberry} alt="Логотип" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            <Logo showIcon={false} />
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
            <p className="text-purple-200/60 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;