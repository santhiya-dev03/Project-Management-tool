import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../store/taskStore';
import { Calendar, MessageSquare, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { format, isPast, isToday } from 'date-fns';

interface Props {
  task: Task;
  isOverlay?: boolean;
  onSelect?: (id: string) => void;
}

export default function TaskCard({ task, isOverlay, onSelect }: Props) {
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'Done';
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const priorityColors = {
    Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Urgent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 rounded-lg border-2 border-dashed border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/5 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect?.(task.id)}
      className={clsx(
        "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-[hsl(var(--primary))]/30 transition-all relative group",
        isOverlay && "rotate-2 scale-105 shadow-xl cursor-grabbing",
        isOverdue && "border-red-500/50 bg-red-500/[0.02]"
      )}
    >
      {isOverdue && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm z-10 animate-bounce">
          Overdue
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <span className={clsx(
          "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1", 
          priorityColors[task.priority]
        )}>
          {task.priority === 'Urgent' && <AlertCircle className="w-3 h-3" />}
          {task.priority}
        </span>
      </div>
      
      <h4 className="font-semibold text-[hsl(var(--foreground))] mb-1 text-sm group-hover:text-[hsl(var(--primary))] transition-colors">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[hsl(var(--border))/50">
        <div className="flex items-center gap-3 text-[hsl(var(--muted-foreground))]">
          {task.due_date && (
            <div className={clsx("flex items-center gap-1 text-[10px]", isOverdue ? "text-red-500 font-bold" : "text-[hsl(var(--muted-foreground)) statistics]")} title="Due Date">
              {isOverdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px]" title="Subtasks">
            <CheckSquare className="w-3 h-3" />
            <span>{task.subtasks?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]" title="Comments">
            <MessageSquare className="w-3 h-3" />
            <span>0</span>
          </div>
        </div>
        
        {task.assigned_to && (
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[hsl(var(--primary))] to-purple-400 text-white flex items-center justify-center text-[8px] font-bold shadow-sm" title="Assignee">
            U
          </div>
        )}
      </div>
    </div>
  );
}
