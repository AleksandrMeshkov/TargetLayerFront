import React, { useCallback } from 'react';
import { useRoadmaps } from '../../hooks/roadmapsHooks/useRoadmaps.ts';
import { TaskItem } from '../../components/roadmaps/TaskItem';
import { RoadmapsHeader } from '../../components/roadmaps/RoadmapsHeader';
import { RoadmapsSidebar } from '../../components/roadmaps/RoadmapsSidebar';
import { CreateRoadmapModal } from '../../components/roadmaps/CreateRoadmapModal';
import { ManageRoadmapModal } from '../../components/roadmaps/ManageRoadmapModal';
import { AddTaskModal } from '../../components/roadmaps/AddTaskModal';

const Roadmaps: React.FC = () => {
  const {
    personal,
    tasks,
    goal,
    modals,
  } = useRoadmaps();

  const handleSubmitNewTask = useCallback(async () => {
    const created = await tasks.createTask(modals.addTaskModal.title, modals.addTaskModal.description);
    if (created) {
      modals.addTaskModal.close();
    }
  }, [tasks, modals.addTaskModal]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <RoadmapsHeader
        selectedRoadmap={personal.selectedRoadmap}
        onOpenCreateRoadmap={modals.createRoadmapModal.open}
        onOpenManageRoadmap={modals.manageRoadmapModal.open}
        isCreateDisabled={modals.createRoadmapModal.isSubmitting}
        isManageDisabled={personal.isDeletingRoadmap || goal.isSavingGoal}
      />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        <RoadmapsSidebar
          roadmaps={personal.roadmaps}
          selectedRoadmapId={personal.selectedRoadmapId}
          isLoading={personal.isLoadingRoadmaps}
          getRoadmapTaskCount={tasks.getRoadmapTaskCount}
          onSelectRoadmap={personal.selectRoadmap}
        />

        <div className="theme-panel flex min-h-0 flex-col rounded-2xl p-4 sm:p-6">
          {!personal.selectedRoadmap && !personal.isLoadingRoadmaps && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border-color))/0.3] bg-[rgb(var(--surface-soft))/0.4] px-4 py-10 text-center text-sm text-[rgb(var(--muted-fg))]">
              Выберите роудмап, чтобы увидеть его задачи.
            </div>
          )}

          {personal.selectedRoadmap && (
            <div className="flex min-h-0 flex-1 flex-col gap-5">
              <div className="theme-panel rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="theme-heading mt-2 text-2xl font-bold">
                      {personal.selectedRoadmap.goal?.title ?? `Роудмап #${personal.selectedRoadmap.roadmap_id}`}
                    </h2>
                    {personal.selectedRoadmap.goal?.description && (
                      <p className="theme-muted mt-2 max-w-3xl text-sm leading-relaxed">
                        {personal.selectedRoadmap.goal.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-start justify-end gap-3">
                    <div className="rounded-xl border border-[rgb(var(--border-color))/0.35] bg-[rgb(var(--surface-soft))/0.55] px-4 py-3 text-sm">
                      <p className="mt-1">Задач: {tasks.visibleTasks.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <p className="theme-muted text-sm font-medium">Задачи роудмапа</p>
                  <button
                    type="button"
                    onClick={modals.addTaskModal.open}
                    className="theme-button-secondary"
                    disabled={tasks.isLoadingTasks || personal.isDeletingRoadmap}
                  >
                    Добавить задачу
                  </button>
                  {tasks.isLoadingTasks && (
                    <span className="inline-flex items-center gap-2 text-xs text-[rgb(var(--muted-fg))]">
                      Загружаю задачи...
                    </span>
                  )}
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 bg-[rgb(var(--surface))]">
                  {tasks.visibleTasks.map((task) => (
                    <TaskItem
                      key={task.task_id}
                      task={task}
                      editingTaskId={tasks.editingTaskId}
                      editTaskTitle={tasks.editTaskTitle}
                      editTaskDescription={tasks.editTaskDescription}
                      taskBusyIds={tasks.taskBusyIds}
                      onToggleComplete={() => void tasks.toggleTaskComplete(task)}
                      onStartEdit={() => tasks.startEditTask(task)}
                      onSaveEdit={() => void tasks.saveTask(task)}
                      onDelete={() => void tasks.deleteTask(task)}
                      onCancelEdit={tasks.cancelEditTask}
                      onChangeEditTitle={(value) => tasks.setEditTaskTitle(value)}
                      onChangeEditDescription={(value) => tasks.setEditTaskDescription(value)}
                    />
                  ))}

                  {!tasks.isLoadingTasks && tasks.visibleTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[rgb(var(--border-color))/0.3] bg-[rgb(var(--surface-soft))/0.4] px-4 py-8 text-sm text-[rgb(var(--muted-fg))]">
                      У этого роудмапа пока нет задач.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateRoadmapModal
        isOpen={modals.createRoadmapModal.isOpen}
        isSubmitting={modals.createRoadmapModal.isSubmitting}
        title={modals.createRoadmapModal.title}
        description={modals.createRoadmapModal.description}
        teamId={modals.createRoadmapModal.teamId}
        tasks={modals.createRoadmapModal.tasks}
        onClose={modals.createRoadmapModal.close}
        onSubmit={modals.createRoadmapModal.onSubmit}
        onChangeTitle={modals.createRoadmapModal.setTitle}
        onChangeDescription={modals.createRoadmapModal.setDescription}
        onChangeTeamId={modals.createRoadmapModal.setTeamId}
        onChangeTask={modals.createRoadmapModal.onChangeTask}
        onAddTask={modals.createRoadmapModal.onAddTask}
        onRemoveTask={modals.createRoadmapModal.onRemoveTask}
      />

      <ManageRoadmapModal
        isOpen={modals.manageRoadmapModal.isOpen}
        selectedRoadmap={personal.selectedRoadmap}
        goalTitleDraft={goal.goalTitleDraft}
        goalDescriptionDraft={goal.goalDescriptionDraft}
        isSavingGoal={goal.isSavingGoal}
        isDeletingRoadmap={personal.isDeletingRoadmap}
        onClose={modals.manageRoadmapModal.close}
        onSaveGoal={() => void goal.saveGoal()}
        onDeleteRoadmap={() => void personal.deleteSelectedRoadmap()}
        onChangeGoalTitle={goal.setGoalTitleDraft}
        onChangeGoalDescription={goal.setGoalDescriptionDraft}
      />

      <AddTaskModal
        isOpen={modals.addTaskModal.isOpen}
        selectedRoadmap={personal.selectedRoadmap}
        isSubmitting={tasks.isCreatingTask}
        isLoadingTasks={tasks.isLoadingTasks}
        isDeletingRoadmap={personal.isDeletingRoadmap}
        title={modals.addTaskModal.title}
        description={modals.addTaskModal.description}
        onClose={modals.addTaskModal.close}
        onSubmit={() => void handleSubmitNewTask()}
        onChangeTitle={modals.addTaskModal.setTitle}
        onChangeDescription={modals.addTaskModal.setDescription}
      />
    </section>
  );
};

export default Roadmaps;
