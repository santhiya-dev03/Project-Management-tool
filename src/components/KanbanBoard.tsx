import { useMemo } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useTaskStore } from '../store/taskStore';
import type { Task } from '../store/taskStore';
import KanbanColumn from './KanbanColumn.tsx';
import TaskCard from './TaskCard.tsx';
import TaskDetail from './TaskDetail.tsx';
import { useState } from 'react';

const COLUMNS: Task['status'][] = ['To Do', 'In Progress', 'Done'];

export default function KanbanBoard() {
  const { tasks, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const columns = useMemo(() => {
    return COLUMNS.map(status => ({
      id: status,
      tasks: tasks.filter(task => task.status === status)
    }));
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isOverAColumn = COLUMNS.includes(overId as any);
    
    if (isOverAColumn) {
      moveTask(activeId, overId as Task['status']);
      return;
    }

    const overTask = tasks.find(t => t.id === overId);
    if (overTask && overTask.status) {
      moveTask(activeId, overTask.status);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {columns.map(col => (
            <KanbanColumn 
              key={col.id} 
              title={col.id} 
              tasks={col.tasks} 
              onTaskClick={setSelectedTaskId}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {selectedTaskId && (
        <TaskDetail 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </>
  );
}
