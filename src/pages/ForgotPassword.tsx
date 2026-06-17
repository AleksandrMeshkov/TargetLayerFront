import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

import AuthLayout from '../components/AuthLayout';
import { requestPasswordRecovery } from '../api/auth/passwordClient';
import { getValidationToastMessage } from '../utils/forms/validationMessage';

type FormData = {
  email: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onInvalid = (validationErrors: Record<string, unknown>) => {
    toast.error(getValidationToastMessage(validationErrors, 'Проверьте корректность заполнения формы'));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await requestPasswordRecovery({ email: data.email });
      toast.success(response.message || 'Письмо для восстановления отправлено');
      navigate('/login', { replace: true });
    } catch (error) {
      
    }
  };

  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Укажите email — мы отправим ссылку для восстановления"
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <div className="space-y-2">
          <label className="theme-label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
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
              className="theme-input w-full pl-11 pr-4 py-3"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.email.message)}</p>}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="theme-button-primary w-full flex items-center justify-center gap-2"
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
