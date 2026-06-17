import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { getMyRoadmaps, shareRoadmapToTeam } from '../../api/roadmaps/roadmapApi';
import type { RoadmapItem } from '../../types/roadmapsTypes/roadmapsTypes';

type UseTeamShareRoadmapParams = {
	teamId: number;
	isAdmin: boolean;
	onShared: () => Promise<void>;
};

const sortRoadmapsByUpdate = (roadmaps: RoadmapItem[]): RoadmapItem[] => {
	return [...roadmaps].sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
};

export function useTeamShareRoadmap({ teamId, isAdmin, onShared }: UseTeamShareRoadmapParams) {
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [myRoadmaps, setMyRoadmaps] = useState<RoadmapItem[]>([]);
	const [isLoadingMyRoadmaps, setIsLoadingMyRoadmaps] = useState(false);
	const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
	const [isSharingRoadmap, setIsSharingRoadmap] = useState(false);

	const openShareModal = useCallback(async () => {
		if (!isAdmin) {
			toast.error('Поделиться роудмапом может только администратор команды');
			return;
		}

		setIsShareModalOpen(true);
		setSelectedRoadmapId(null);

		try {
			setIsLoadingMyRoadmaps(true);
			const response = await getMyRoadmaps();
			const personalRoadmaps = response.roadmaps.filter((roadmap) => roadmap.team_id == null);
			setMyRoadmaps(sortRoadmapsByUpdate(personalRoadmaps));
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось загрузить личные роудмапы';
		} finally {
			setIsLoadingMyRoadmaps(false);
		}
	}, [isAdmin]);

	const closeShareModal = useCallback(() => {
		if (isSharingRoadmap) {
			return;
		}

		setIsShareModalOpen(false);
		setSelectedRoadmapId(null);
	}, [isSharingRoadmap]);

	const shareRoadmap = useCallback(async () => {
		if (!selectedRoadmapId) {
			toast.error('Выберите роудмап для шаринга');
			return;
		}

		if (!Number.isFinite(teamId) || teamId <= 0) {
			toast.error('Некорректный идентификатор команды');
			return;
		}

		try {
			setIsSharingRoadmap(true);
			await shareRoadmapToTeam(selectedRoadmapId, { team_id: teamId });
			toast.success('Роудмап успешно добавлен в команду');
			setIsShareModalOpen(false);
			setSelectedRoadmapId(null);
			await onShared();
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Не удалось поделиться роудмапом';
		} finally {
			setIsSharingRoadmap(false);
		}
	}, [onShared, selectedRoadmapId, teamId]);

	return {
		isShareModalOpen,
		myRoadmaps,
		isLoadingMyRoadmaps,
		selectedRoadmapId,
		setSelectedRoadmapId,
		isSharingRoadmap,
		openShareModal,
		closeShareModal,
		shareRoadmap,
	};
}