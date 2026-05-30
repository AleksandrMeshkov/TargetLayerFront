import React from 'react';
import { Search as SearchIcon, Users } from 'lucide-react';

type SearchHeaderProps = {
	query: string;
	onQueryChange: (value: string) => void;
};

export function SearchHeader({ query, onQueryChange }: SearchHeaderProps) {
	return (
		<div className="theme-panel rounded-2xl p-6 sm:p-8">
			<div className="mb-6 flex items-center gap-3">
				<Users className="theme-accent h-8 w-8" />
				<div>
					<h1 className="theme-heading text-3xl font-bold">Поиск пользователей</h1>
					<p className="theme-muted mt-1 text-sm">Найдите пользователя по никнейму</p>
				</div>
			</div>

			<label className="relative block">
				<SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--muted-fg))]" />
				<input
					type="text"
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Введите никнейм, например alex"
					className="theme-input w-full py-3 pl-12 pr-4 text-sm"
				/>
			</label>
		</div>
	);
}