import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { toast } from 'react-toastify';

const schema = z.object({
  name: z.string().min(2, 'Введите ваше имя'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен быть не менее 8 символов'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Аккаунт успешно создан!');
  };

  return (
    <AuthLayout 
      title="Создать аккаунт" 
      subtitle="Начните декомпозировать свои мечты в реальные задачи"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-purple-200/70 ml-1">Имя</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            <input
              {...register('name')}
              type="text"
              placeholder="Александр"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-purple-200/70 ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            <input
              {...register('email')}
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-purple-200/70 ml-1">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-purple-200/70 ml-1">Подтвердите пароль</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50 w-5 h-5" />
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="pt-2">
          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
          >
            {isSubmitting ? 'Создание...' : 'Создать аккаунт'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center text-sm text-purple-200/60 mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-purple-400 font-medium hover:underline">Войти</Link>
        </p>
      </form>
    </AuthLayout>
  );
}