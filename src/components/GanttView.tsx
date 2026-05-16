import { useMemo } from 'react';
import { format, addDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import clsx from 'clsx';

export default function GanttView() {
  const { tasks } = useTaskStore();
  
  const today = startOfToday();
  const timelineDays = useMemo(() => {
    return eachDayOfInterval({
      start: today,
      end: addDays(today, 30),
    });
  }, [today]);

  const taskRows = useMemo(() => {
    return tasks.filter(t => t.due_date);
  }, [tasks]);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1200px]">
          {/* Timeline Header */}
          <div className="flex border-b border-[hsl(var(--border))] sticky top-0 bg-[hsl(var(--card))] z-10">
            <div className="w-64 p-4 border-r border-[hsl(var(--border))] font-bold text-sm shrink-0">
              Task Name
            </div>
            <div className="flex">
              {timelineDays.map(day => (
                <div 
                  key={day.toString()} 
                  className={clsx(
                    "w-12 py-3 text-center border-r border-[hsl(var(--border))] text-[10px] font-bold uppercase",
                    isSameDay(day, today) && "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                  )}
                >
                  <div className="opacity-50">{format(day, 'EEE')}</div>
                  <div>{format(day, 'd')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-[hsl(var(--border))]">
            {taskRows.map(task => {
              const taskDate = new Date(task.due_date!);
              const dayIndex = timelineDays.findIndex(d => isSameDay(d, taskDate));
              
              return (
                <div key={task.id} className="flex group hover:bg-[hsl(var(--muted))]/10 transition-colors">
                  <div className="w-64 p-3 border-r border-[hsl(var(--border))] text-xs font-medium truncate shrink-0">
                    {task.title}
                  </div>
                  <div className="flex relative flex-1">
                    {timelineDays.map((_, idx) => (
                      <div key={idx} className="w-12 h-10 border-r border-[hsl(var(--border))]/50" />
                    ))}
                    
                    {dayIndex !== -1 && (
                      <div 
                        className={clsx(
                          "absolute top-2 h-6 rounded-full shadow-sm flex items-center px-3 text-[9px] font-bold text-white transition-all hover:scale-105",
                          task.priority === 'Urgent' ? "bg-purple-500" :
                          task.priority === 'High' ? "bg-red-500" :
                          "bg-blue-500"
                        )}
                        style={{ 
                          left: `${dayIndex * 48 + 4}px`,
                          width: '92px' // Simplified: all tasks take 2 units for visual representation
                        }}
                      >
                        {task.status}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {taskRows.length === 0 && (
              <div className="p-20 text-center text-[hsl(var(--muted-foreground))]">
                No tasks with due dates to display in timeline.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
