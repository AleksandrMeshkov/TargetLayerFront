import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, ChevronRight } from 'lucide-react';
import MouseFollower from '../components/MouseFollower';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a051a] text-white overflow-hidden">
      <MouseFollower />
      
      <nav className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-purple-200/70 hover:text-white transition-colors">Вход</Link>
          <Link to="/register" className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-full text-sm font-semibold transition-all">Начать</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 sm:mb-8 font-serif">
              Разложи свои <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">цели</span> на атомы
            </h1>
            <p className="text-lg sm:text-xl text-purple-200/60 mb-6 sm:mb-10 max-w-lg leading-relaxed">
              TargetLayer использует ИИ для декомпозиции масштабных целей в понятные шаги. Достигай большего, не теряя фокуса.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="bg-white text-[#0a051a] px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-50 transition-all group">
                Попробовать сейчас
                <ChevronRight className="group-hover:translate-x-1 transition-transform"/>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 sm:-inset-4 bg-purple-500/20 blur-3xl rounded-full" />
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">ИИ Анализ Цели</h3>
                  <p className="text-xs text-purple-300/50">Обработка запроса</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  "Командная декомопзиция цели",
                  "Выделение ключевых этапов",
                  "Помощь в создании начального плана",
                  "Общение внутри команды",
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm text-purple-100">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}