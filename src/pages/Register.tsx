import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { toast } from 'react-toastify';
import { registerUser } from '../api/auth/client';
import { setAuthSession } from '../api/auth/session';
import { getValidationToastMessage } from '../utils/forms/validationMessage';
import { validatePassword, validatePasswordConfirmation } from '../utils/forms/passwordValidation';

type FormData = {
  username: string;
  name: string;
  surname: string;
  patronymic?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onInvalid = (validationErrors: Record<string, unknown>) => {
    toast.error(getValidationToastMessage(validationErrors, 'Проверьте корректность заполнения формы'));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const tokens = await registerUser({
        username: data.username,
        name: data.name,
        surname: data.surname,
        patronymic: data.patronymic && data.patronymic.trim() ? data.patronymic : undefined,
        email: data.email,
        password: data.password,
      });
      setAuthSession(tokens);
      toast.success('Аккаунт успешно создан!');
      navigate('/app/profile');
    } catch (error) {
      // Silently handle server errors for demo
    }
  };

  return (
    <AuthLayout 
      title="Создать аккаунт" 
      subtitle="Начните декомпозировать свои мечты в реальные задачи"
    >
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="theme-label">Никнейм</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('username', { required: 'Введите никнейм' })}
              type="text"
              placeholder="username123"
              className="theme-input w-full pl-11 pr-4 py-3"
            />
          </div>
          {errors.username && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.username.message)}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="theme-label">Имя</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('name', { required: 'Введите имя' })}
              type="text"
              placeholder="Александр"
              className="theme-input w-full pl-11 pr-4 py-3"
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.name.message)}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="theme-label">Фамилия</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('surname', { required: 'Введите фамилию' })}
              type="text"
              placeholder="Иванов"
              className="theme-input w-full pl-11 pr-4 py-3"
            />
          </div>
          {errors.surname && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.surname.message)}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="theme-label">Отчество <span className="theme-muted">(опционально)</span></label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('patronymic')}
              type="text"
              placeholder="Сергеевич"
              className="theme-input w-full pl-11 pr-4 py-3"
            />
          </div>
          {errors.patronymic && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.patronymic.message)}</p>}
        </div>

        <div className="space-y-1.5">
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

        <div className="space-y-1.5">
          <label className="theme-label">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('password', { validate: validatePassword })}
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

        <div className="space-y-1.5">
          <label className="theme-label">Подтвердите пароль</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted w-5 h-5" />
            <input
              {...register('confirmPassword', {
                validate: (value, formValues) => validatePasswordConfirmation(formValues.password, value),
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="theme-input w-full pl-11 pr-12 py-2.5"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-accent transition-colors"
              aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-1">{String(errors.confirmPassword.message)}</p>}
        </div>

        <div className="pt-2">
          <button
            disabled={isSubmitting}
            type="submit"
            className="theme-button-primary w-full flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Создание...' : 'Создать аккаунт'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center text-sm theme-muted mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="theme-accent font-medium hover:underline">Войти</Link>
        </p>
      </form>
    </AuthLayout>
  );
}