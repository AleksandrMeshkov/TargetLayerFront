import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import { requestPasswordRecovery } from '../api/auth/passwordClient';

type FormData = {
  email: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await requestPasswordRecovery({ email: data.email });
      toast.success(response.message || 'Письмо для восстановления отправлено');
      navigate('/login', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось запросить восстановление пароля';
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Укажите email — мы отправим ссылку для восстановления"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-purple-200/70 ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            <input
              {...register('email', {
                required: 'Введите email',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Введите корректный email',
                },
              })}
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.email.message)}</p>}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить ссылку'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-sm text-purple-200/60 mt-6">
          <Link to="/login" className="text-purple-400 font-medium hover:underline">Вернуться ко входу</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
