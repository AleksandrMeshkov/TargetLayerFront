import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="theme-panel rounded-3xl p-8">
        <h1 className="theme-heading text-3xl font-bold">Внутренняя зона продукта</h1>
        <p className="theme-muted mt-3 max-w-2xl text-sm">
          Это App-зона. Здесь размещаются функции продукта после авторизации.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="theme-panel rounded-2xl p-5">
          <p className="theme-muted text-xs">Статус</p>
          <p className="mt-2 text-lg font-semibold">Авторизован</p>
        </div>
        <div className="theme-panel rounded-2xl p-5">
          <p className="theme-muted text-xs">Зона</p>
          <p className="mt-2 text-lg font-semibold">/app/*</p>
        </div>
        <div className="theme-panel rounded-2xl p-5">
          <p className="theme-muted text-xs">Роутинг</p>
          <p className="mt-2 text-lg font-semibold">Protected Route</p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
