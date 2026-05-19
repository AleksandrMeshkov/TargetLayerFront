import React from 'react';
import { Search as SearchIcon, Users } from 'lucide-react';

type SearchHeaderProps = {
	query: string;
	onQueryChange: (value: string) => void;
};

export function SearchHeader({ query, onQueryChange }: SearchHeaderProps) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
			<div className="mb-6 flex items-center gap-3">
				<Users className="h-8 w-8 text-purple-400" />
				<div>
					<h1 className="text-3xl font-bold">Поиск пользователей</h1>
					<p className="mt-1 text-sm text-purple-100/60">Найдите пользователя по никнейму</p>
				</div>
			</div>

			<label className="relative block">
				<SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-200/70" />
				<input
					type="text"
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					placeholder="Введите никнейм, например alex"
					className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-purple-100/40 transition-colors focus:border-purple-400/40"
				/>
			</label>
		</div>
	);
}