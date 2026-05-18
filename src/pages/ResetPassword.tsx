import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import { recoverPassword } from '../api/auth/passwordClient';

type FormData = {
  new_password: string;
  confirm_password: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Ссылка восстановления некорректна или устарела');
      return;
    }

    try {
      const response = await recoverPassword(token, {
        old_password: 'recovery',
        ...data,
      });
      toast.success(response.message || 'Пароль успешно восстановлен');
      navigate('/login', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось восстановить пароль';
      toast.error(message);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Восстановление пароля"
        subtitle="В ссылке отсутствует токен. Запросите письмо ещё раз."
      >
        <div className="space-y-5">
          <Link
            to="/forgot-password"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
          >
            Запросить ссылку
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-center text-sm text-purple-200/60">
            <Link to="/login" className="text-purple-400 font-medium hover:underline">Вернуться ко входу</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Новый пароль"
      subtitle="Введите новый пароль и подтвердите его"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-purple-200/70 ml-1">Новый пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            <input
              {...register('new_password', { required: 'Введите новый пароль' })}
              type={showNew ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/70 hover:text-purple-200 transition-colors"
              aria-label={showNew ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.new_password && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.new_password.message)}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-purple-200/70 ml-1">Подтверждение пароля</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            <input
              {...register('confirm_password', { required: 'Подтвердите новый пароль' })}
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/70 hover:text-purple-200 transition-colors"
              aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirm_password && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.confirm_password.message)}</p>}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
        >
          {isSubmitting ? 'Сохранение' : 'Сохранить новый пароль'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-sm text-purple-200/60 mt-6">
          <Link to="/login" className="text-purple-400 font-medium hover:underline">Вернуться ко входу</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
