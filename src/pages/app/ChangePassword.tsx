import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changePassword } from '../../api/auth/passwordClient';

type ChangePasswordForm = {
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
};

const ChangePassword: React.FC = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState<ChangePasswordForm>({
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (submitting) return;

		const { oldPassword, newPassword, confirmPassword } = form;

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
			<div className="theme-panel rounded-2xl p-6 sm:p-8">
				<div className="mb-8 flex items-center gap-3">
					<KeyRound className="theme-accent h-8 w-8" />
					<h1 className="theme-heading text-3xl font-bold">Смена пароля</h1>
				</div>

				<form onSubmit={handleSubmit} className="max-w-md space-y-4">
					<div>
						<label htmlFor="old-password" className="theme-label mb-1 text-xs">
							Старый пароль
						</label>
						<input
							id="old-password"
							name="oldPassword"
							type="password"
							value={form.oldPassword}
							onChange={handleChange}
							autoComplete="current-password"
							className="theme-input"
						/>
					</div>

					<div>
						<label htmlFor="new-password" className="theme-label mb-1 text-xs">
							Новый пароль
						</label>
						<input
							id="new-password"
							name="newPassword"
							type="password"
							value={form.newPassword}
							onChange={handleChange}
							autoComplete="new-password"
							className="theme-input"
						/>
					</div>

					<div>
						<label htmlFor="confirm-password" className="theme-label mb-1 text-xs">
							Подтверждение нового пароля
						</label>
						<input
							id="confirm-password"
							name="confirmPassword"
							type="password"
							value={form.confirmPassword}
							onChange={handleChange}
							autoComplete="new-password"
							className="theme-input"
						/>
					</div>

					<div className="flex gap-2 pt-2">
						<button
							type="submit"
							disabled={submitting}
							className="theme-button-primary"
						>
							{submitting ? 'Сохранение...' : 'Изменить пароль'}
						</button>
						<button
							type="button"
							onClick={() => navigate('/app/profile')}
							disabled={submitting}
							className="theme-button-secondary"
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
