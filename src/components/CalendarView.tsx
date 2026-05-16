import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import clsx from 'clsx';

export default function CalendarView() {
  const { tasks } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => task.due_date && isSameDay(new Date(task.due_date), day));
  };

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/50">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[hsl(var(--primary))]" />
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors text-[hsl(var(--muted-foreground))]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm font-medium hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors text-[hsl(var(--foreground))]"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors text-[hsl(var(--muted-foreground))]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-[hsl(var(--border))]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 h-full min-h-[600px]">
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            return (
              <div
                key={day.toString()}
                className={clsx(
                  "min-h-[120px] p-2 border-r border-b border-[hsl(var(--border))] transition-colors group",
                  !isSameMonth(day, monthStart) && "bg-[hsl(var(--muted))]/30 text-[hsl(var(--muted-foreground))]",
                  isSameDay(day, new Date()) && "bg-[hsl(var(--primary))]/5"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={clsx(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                    isSameDay(day, new Date()) ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--foreground))]"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={clsx(
                        "text-[10px] p-1.5 rounded border shadow-sm truncate font-medium",
                        task.priority === 'High' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                        task.priority === 'Medium' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                        "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
