import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changePassword } from '../../api/auth/passwordClient';

const ChangePassword: React.FC = () => {
	const navigate = useNavigate();
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!oldPassword || !newPassword || !confirmPassword) {
			toast.error('Заполните все поля');
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error('Новый пароль и подтверждение не совпадают');
			return;
		}

		try {
			setSubmitting(true);
			await changePassword({
				old_password: oldPassword,
				new_password: newPassword,
				confirm_password: confirmPassword,
			});

			toast.success('Пароль успешно изменен');
			navigate('/app/profile');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось сменить пароль';
			toast.error(message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="space-y-6">
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
				<div className="mb-8 flex items-center gap-3">
					<KeyRound className="h-8 w-8 text-purple-400" />
					<h1 className="text-3xl font-bold">Смена пароля</h1>
				</div>

				<form onSubmit={handleSubmit} className="max-w-md space-y-4">
					<div>
						<label htmlFor="old-password" className="mb-1 block text-xs font-medium text-purple-200">
							Старый пароль
						</label>
						<input
							id="old-password"
							type="password"
							value={oldPassword}
							onChange={(event) => setOldPassword(event.target.value)}
							autoComplete="current-password"
							className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
						/>
					</div>

					<div>
						<label htmlFor="new-password" className="mb-1 block text-xs font-medium text-purple-200">
							Новый пароль
						</label>
						<input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(event) => setNewPassword(event.target.value)}
							autoComplete="new-password"
							className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
						/>
					</div>

					<div>
						<label htmlFor="confirm-password" className="mb-1 block text-xs font-medium text-purple-200">
							Подтверждение нового пароля
						</label>
						<input
							id="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							autoComplete="new-password"
							className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none placeholder:text-purple-100/40"
						/>
					</div>

					<div className="flex gap-2 pt-2">
						<button
							type="submit"
							disabled={submitting}
							className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-60"
						>
							{submitting ? 'Сохранение...' : 'Изменить пароль'}
						</button>
						<button
							type="button"
							onClick={() => navigate('/app/profile')}
							disabled={submitting}
							className="rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-purple-200 transition-colors hover:bg-white/10 disabled:opacity-60"
						>
							Отмена
						</button>
					</div>
				</form>
			</div>
		</section>
	);
};

export default ChangePassword;
