import React from 'react';
import { MessageCircle } from 'lucide-react';

const Chat: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold">АИ Чат</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-purple-100/70">
          Обсуждайте свои цели и задачи с ИИ-ассистентом. Получайте помощь в планировании и декомпозиции целей.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 min-h-[400px]">
        <p className="text-purple-100/60 text-sm">Чат</p>
      </div>
    </section>
  );
};

export default Chat;
