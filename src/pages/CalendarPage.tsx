import CalendarView from '../components/CalendarView';

export default function CalendarPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Global Calendar</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Visualize all task deadlines across all your workspaces</p>
      </div>

      <div className="flex-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <CalendarView />
      </div>
    </div>
  );
}
