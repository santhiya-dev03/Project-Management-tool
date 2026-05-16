import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../store/taskStore';
import TaskCard from './TaskCard.tsx';
import clsx from 'clsx';

interface Props {
  title: string;
  tasks: Task[];
  onTaskClick: (id: string) => void;
}

export default function KanbanColumn({ title, tasks, onTaskClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
  });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-[hsl(var(--foreground))]">{title}</h3>
        <span className="bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] text-xs font-medium px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 bg-[hsl(var(--secondary))]/50 rounded-xl p-3 flex flex-col gap-3 min-h-[150px] transition-colors",
          isOver && "bg-[hsl(var(--secondary))]"
        )}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onSelect={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
