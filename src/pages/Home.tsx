import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, ChevronRight } from 'lucide-react';
import MouseFollower from '../components/MouseFollower';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div className="theme-shell relative overflow-hidden">
      <MouseFollower />
      
      <nav className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-[rgb(var(--muted-fg))] transition-colors hover:text-[rgb(var(--page-fg))]">Вход</Link>
          <Link to="/register" className="theme-button-primary rounded-full px-5 py-2">Начать</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            <h1 className="fixed-hero-title mb-6 font-serif text-4xl font-bold leading-tight sm:mb-8 sm:text-5xl md:text-6xl lg:text-7xl">
              Разложи свои <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">цели</span> на атомы
            </h1>
            <p className="fixed-hero-subtitle font-medium mb-6 max-w-lg text-lg leading-relaxed sm:mb-10 sm:text-xl">
              TargetLayer использует ИИ для декомпозиции масштабных целей в понятные шаги. Достигай большего, не теряя фокуса.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="theme-button-secondary flex items-center gap-2 rounded-2xl px-6 py-3 font-bold sm:px-8 sm:py-4 group">
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
            <div className="theme-panel relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">ИИ Анализ Цели</h3>
                  <p className="text-xs text-[rgb(var(--muted-fg))]">Обработка запроса</p>
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
                    className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.55] p-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-sm text-[rgb(var(--page-fg))]">{text}</span>
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