import React from 'react';
import { Map } from 'lucide-react';

const Roadmaps: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center gap-3 mb-4">
          <Map className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Роудмапы</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-purple-100/70">
          Создавайте и управляйте роудмапами для достижения ваших целей. Разбивайте крупные цели на управляемые этапы.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 min-h-[400px]">
        <p className="text-purple-100/60 text-sm">Роудмапы</p>
      </div>
    </section>
  );
};

export default Roadmaps;
