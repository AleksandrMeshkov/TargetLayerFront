import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Внутренняя зона продукта</h1>
        <p className="mt-3 max-w-2xl text-sm text-purple-100/70">
          Это App-зона. Здесь размещаются функции продукта после авторизации.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs text-purple-100/60">Статус</p>
          <p className="mt-2 text-lg font-semibold">Авторизован</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs text-purple-100/60">Зона</p>
          <p className="mt-2 text-lg font-semibold">/app/*</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs text-purple-100/60">Роутинг</p>
          <p className="mt-2 text-lg font-semibold">Protected Route</p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
