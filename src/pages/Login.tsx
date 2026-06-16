import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { toast } from 'react-toastify';
import { loginUser } from '../api/auth/client';
import { setAuthSession } from '../api/auth/session';
import { getValidationToastMessage } from '../utils/forms/validationMessage';

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onInvalid = (validationErrors: Record<string, unknown>) => {
    toast.error(getValidationToastMessage(validationErrors, 'Проверьте корректность заполнения формы'));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const tokens = await loginUser({
        email: data.email,
        password: data.password,
      });
      setAuthSession(tokens);
      toast.success('Успешный вход!');
      navigate('/app/profile');
    } catch (error) {
      // Silently handle server errors for demo
    }
  };

  return (
    <AuthLayout 
      title="С возвращением" 
      subtitle="Войдите, чтобы продолжить работу над вашими целями"
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

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="theme-label">Пароль</label>
            <Link to="/forgot-password" className="theme-accent text-xs font-medium hover:underline">Забыли пароль?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('password', { required: 'Введите пароль' })}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="theme-input w-full pl-11 pr-12 py-3"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-accent transition-colors"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.password.message)}</p>}
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="theme-button-primary w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Вход...' : 'Войти в аккаунт'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-sm theme-muted mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="theme-accent font-medium hover:underline">Зарегистрироваться</Link>
        </p>
      </form>
    </AuthLayout>
  );
}