import React from 'react';
import Logo from '../components/Logo';

const NotFound: React.FC = () => (
  <section className="flex items-center justify-center min-h-screen bg-black text-white">
    <div className="text-center p-6">
      <h1 className="text-3xl font-bold mb-2">Страница не найдена</h1>
      <p className="mb-4 text-white/70">Похоже, этой страницы не существует.</p>
      <a href="/" className="inline-block bg-white text-black px-4 py-2 rounded">На главную</a>
      <div className="mt-6 text-sm text-white/50 flex items-center justify-center gap-2">
        <span>{new Date().getFullYear()} -</span>
        <Logo showIcon={false} />
      </div>
    </div>
  </section>
);

export default NotFound;