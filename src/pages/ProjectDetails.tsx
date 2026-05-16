import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import KanbanBoard from '../components/KanbanBoard';
import CalendarView from '../components/CalendarView';
import GanttView from '../components/GanttView';
import TeamChat from '../components/TeamChat';
import TaskModal from '../components/TaskModal';
import { ArrowLeft, Plus, LayoutGrid, Calendar as CalendarIcon, GanttChartSquare, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [view, setView] = useState<'kanban' | 'calendar' | 'timeline'>('kanban');
  const { fetchTasks } = useTaskStore();

  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setProject(data as Project);
        await fetchTasks(id);
      } catch (error) {
        console.error('Error loading project:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    
    loadProject();
  }, [id, fetchTasks, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{project.name}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex -space-x-2 mr-4">
            <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--background))] bg-blue-500 flex items-center justify-center text-white text-xs font-bold z-20 shadow-sm">S</div>
            <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--background))] bg-green-500 flex items-center justify-center text-white text-xs font-bold z-10 shadow-sm">J</div>
            <button className="w-8 h-8 rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--muted-foreground))] text-xs font-bold hover:bg-[hsl(var(--accent))] transition-colors z-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-9 p-1 bg-[hsl(var(--secondary))] rounded-lg flex items-center shadow-inner">
            <button
              onClick={() => setView('kanban')}
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                view === 'kanban' ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
            <button
              onClick={() => setView('calendar')}
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                view === 'calendar' ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setView('timeline')}
              className={clsx(
                "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                view === 'timeline' ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <GanttChartSquare className="w-3.5 h-3.5" />
              Timeline
            </button>
          </div>
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all text-sm relative",
              isChatOpen ? "bg-[hsl(var(--primary))] text-white shadow-lg" : "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[hsl(var(--background))]" />
          </button>
          
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:bg-[hsl(var(--primary))]/90 transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Main Board/Calendar View */}
      <div className="flex-1 overflow-hidden min-h-0">
        {view === 'kanban' ? (
          <KanbanBoard />
        ) : view === 'calendar' ? (
          <CalendarView />
        ) : (
          <GanttView />
        )}
      </div>

      {isTaskModalOpen && id && (
        <TaskModal 
          projectId={id} 
          onClose={() => setIsTaskModalOpen(false)} 
        />
      )}

      {isChatOpen && (
        <TeamChat onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}

