import React from 'react';
import { Link } from 'react-router-dom';

const AppNotFound: React.FC = () => {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
      <h1 className="text-2xl font-bold">Страница внутри App-зоны не найдена</h1>
      <p className="mt-3 text-sm text-purple-100/70">Проверьте URL или вернитесь на дашборд.</p>
      <Link
        to="/app"
        className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
      >
        Вернуться в App
      </Link>
    </section>
  );
};

export default AppNotFound;
