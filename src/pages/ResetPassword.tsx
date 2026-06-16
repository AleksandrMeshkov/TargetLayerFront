import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import { recoverPassword } from '../api/auth/passwordClient';
import { getValidationToastMessage } from '../utils/forms/validationMessage';
import { validatePassword, validatePasswordConfirmation } from '../utils/forms/passwordValidation';

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

  const onInvalid = (validationErrors: Record<string, unknown>) => {
    toast.error(getValidationToastMessage(validationErrors, 'Проверьте корректность заполнения формы'));
  };

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
      // Silently handle server errors for demo
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
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
          <div className="space-y-2">
          <label className="theme-label">Новый пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('new_password', { validate: validatePassword })}
              type={showNew ? 'text' : 'password'}
              placeholder="••••••••"
              className="theme-input w-full pl-11 pr-12 py-3"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-accent transition-colors"
              aria-label={showNew ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.new_password && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.new_password.message)}</p>}
        </div>

          <div className="space-y-2">
          <label className="theme-label">Подтверждение пароля</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('confirm_password', {
                validate: (value, formValues) => validatePasswordConfirmation(formValues.new_password, value),
              })}
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              className="theme-input w-full pl-11 pr-12 py-3"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-accent transition-colors"
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
          className="theme-button-primary w-full flex items-center justify-center gap-2"
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
