import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { copyRoadmap as copyRoadmapRequest, deleteTeamRoadmap as deleteTeamRoadmapRequest, getRoadmapTasks, getRoadmapsByTeam, setRoadmapTaskComplete } from '../../api/roadmaps/roadmapApi';
import type { RoadmapItem, RoadmapTask } from '../../types/roadmapsTypes/roadmapsTypes';

const sortRoadmaps = (roadmaps: RoadmapItem[]): RoadmapItem[] => {
	return [...roadmaps].sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
};

const sortTasks = (tasks: RoadmapTask[]): RoadmapTask[] => {
	return [...tasks].sort((left, right) => left.order_index - right.order_index);
};

type UseTeamRoadmapsParams = {
	teamId: number;
};

export function useTeamRoadmaps({ teamId }: UseTeamRoadmapsParams) {
	const [teamRoadmaps, setTeamRoadmaps] = useState<RoadmapItem[]>([]);
	const [isLoadingTeamRoadmaps, setIsLoadingTeamRoadmaps] = useState(false);
	const [selectedTeamRoadmapId, setSelectedTeamRoadmapId] = useState<number | null>(null);
	const [teamTasksCache, setTeamTasksCache] = useState<Record<number, RoadmapTask[]>>({});
	const [isLoadingTeamRoadmapTasks, setIsLoadingTeamRoadmapTasks] = useState(false);
	const [teamTaskBusyIds, setTeamTaskBusyIds] = useState<Record<number, boolean>>({});
	const [isDeletingTeamRoadmap, setIsDeletingTeamRoadmap] = useState(false);
	const [isCopyingRoadmap, setIsCopyingRoadmap] = useState(false);

	const loadTeamRoadmaps = useCallback(async () => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			return;
		}

		try {
			setIsLoadingTeamRoadmaps(true);
			const response = await getRoadmapsByTeam(teamId);
			setTeamRoadmaps(sortRoadmaps(response.roadmaps));
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить роудмапы команды';
		} finally {
			setIsLoadingTeamRoadmaps(false);
		}
	}, [teamId]);

	useEffect(() => {
		setTeamRoadmaps([]);
		setSelectedTeamRoadmapId(null);
		setTeamTasksCache({});
		setIsLoadingTeamRoadmapTasks(false);
		setTeamTaskBusyIds({});
		void loadTeamRoadmaps();
	}, [loadTeamRoadmaps, teamId]);

	const selectedTeamRoadmap = useMemo(
		() => teamRoadmaps.find((roadmap) => roadmap.roadmap_id === selectedTeamRoadmapId) ?? null,
		[teamRoadmaps, selectedTeamRoadmapId],
	);

	const visibleTeamRoadmapTasks = useMemo(() => {
		if (!selectedTeamRoadmap) {
			return [];
		}

		const cached = selectedTeamRoadmapId != null ? teamTasksCache[selectedTeamRoadmapId] : undefined;
		return sortTasks(cached ?? selectedTeamRoadmap.tasks ?? []);
	}, [selectedTeamRoadmap, selectedTeamRoadmapId, teamTasksCache]);

	const setTeamTaskBusy = useCallback((taskId: number, busy: boolean) => {
		setTeamTaskBusyIds((prev) => ({ ...prev, [taskId]: busy }));
	}, []);

	const updateTeamRoadmapTasksState = useCallback((roadmapId: number, updater: (tasks: RoadmapTask[]) => RoadmapTask[]) => {
		setTeamRoadmaps((prev) => prev.map((item) => {
			if (item.roadmap_id !== roadmapId) {
				return item;
			}

			return {
				...item,
				tasks: updater(item.tasks),
			};
		}));
	}, []);

	const updateCachedTeamTask = useCallback((roadmapId: number, updatedTask: RoadmapTask) => {
		setTeamTasksCache((prev) => {
			const current = prev[roadmapId];
			if (!current) {
				return prev;
			}

			return {
				...prev,
				[roadmapId]: current.map((task) => (task.task_id === updatedTask.task_id ? updatedTask : task)),
			};
		});

		updateTeamRoadmapTasksState(roadmapId, (tasks) => tasks.map((task) => (
			task.task_id === updatedTask.task_id ? updatedTask : task
		)));
	}, [updateTeamRoadmapTasksState]);

	const selectTeamRoadmap = useCallback(async (roadmapId: number): Promise<void> => {
		if (selectedTeamRoadmapId === roadmapId) {
			setSelectedTeamRoadmapId(null);
			return;
		}

		setSelectedTeamRoadmapId(roadmapId);

		if (teamTasksCache[roadmapId]) {
			return;
		}

		setIsLoadingTeamRoadmapTasks(true);
		try {
			const tasks = await getRoadmapTasks(roadmapId);
			setTeamTasksCache((prev) => ({ ...prev, [roadmapId]: sortTasks(tasks) }));
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить задачи роудмапа';
		} finally {
			setIsLoadingTeamRoadmapTasks(false);
		}
	}, [selectedTeamRoadmapId, teamTasksCache]);

	const clearSelectedTeamRoadmap = useCallback(() => {
		setSelectedTeamRoadmapId(null);
	}, []);

	const toggleTeamTaskComplete = useCallback(async (task: RoadmapTask): Promise<void> => {
		if (selectedTeamRoadmapId == null) {
			return;
		}

		const nextCompleted = !task.completed;
		setTeamTaskBusy(task.task_id, true);
		try {
			const updated = await setRoadmapTaskComplete(selectedTeamRoadmapId, task.task_id, nextCompleted);
			updateCachedTeamTask(selectedTeamRoadmapId, updated);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось обновить статус задачи';
		} finally {
			setTeamTaskBusy(task.task_id, false);
		}
	}, [selectedTeamRoadmapId, setTeamTaskBusy, updateCachedTeamTask]);

	const copyRoadmap = useCallback(async (roadmapId: number): Promise<void> => {
		try {
			setIsCopyingRoadmap(true);
			const copied = await copyRoadmapRequest(roadmapId);
			toast.success(`Роудмап успешно скопирован в ваш аккаунт #${copied.roadmap_id}`);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось скопировать роудмап';
		} finally {
			setIsCopyingRoadmap(false);
		}
	}, []);

	const deleteTeamRoadmap = useCallback(async (roadmapId: number): Promise<void> => {
		if (!Number.isFinite(teamId) || teamId <= 0) {
			return;
		}

		const roadmapToDelete = teamRoadmaps.find((item) => item.roadmap_id === roadmapId) ?? null;
		if (!roadmapToDelete) {
			return;
		}

		const confirmed = window.confirm('Удалить роудмап из команды? Это действие нельзя отменить.');
		if (!confirmed) {
			return;
		}

		setIsDeletingTeamRoadmap(true);
		try {
			await deleteTeamRoadmapRequest(teamId, roadmapToDelete.roadmap_id);

			const nextRoadmaps = teamRoadmaps.filter((item) => item.roadmap_id !== roadmapToDelete.roadmap_id);
			setTeamRoadmaps(nextRoadmaps);
			setTeamTasksCache((prev) => {
				const { [roadmapToDelete.roadmap_id]: _removed, ...rest } = prev;
				return rest;
			});

			if (selectedTeamRoadmapId === roadmapToDelete.roadmap_id) {
				setSelectedTeamRoadmapId(nextRoadmaps[0]?.roadmap_id ?? null);
				if (nextRoadmaps[0]) {
					await selectTeamRoadmap(nextRoadmaps[0].roadmap_id);
				}
			}

			toast.success('Роудмап удален из команды');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось удалить командный роудмап';
		} finally {
			setIsDeletingTeamRoadmap(false);
		}
	}, [selectTeamRoadmap, selectedTeamRoadmapId, teamId, teamRoadmaps]);

	return {
		teamRoadmaps,
		isLoadingTeamRoadmaps,
		selectedTeamRoadmapId,
		selectedTeamRoadmap,
		visibleTeamRoadmapTasks,
		isLoadingTeamRoadmapTasks,
		teamTaskBusyIds,
		isDeletingTeamRoadmap,
		isCopyingRoadmap,
		loadTeamRoadmaps,
		selectTeamRoadmap,
		clearSelectedTeamRoadmap,
		toggleTeamTaskComplete,
		copyRoadmap,
		deleteTeamRoadmap,
	};
}