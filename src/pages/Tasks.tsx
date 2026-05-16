import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  LayoutList, 
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const { tasks } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
    // For a real app, we might want a global "fetch all tasks" method
    // For now, we'll assume tasks are already loaded or fetched via projects
  }, [fetchProjects]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">My Tasks</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Track and manage all your responsibilities in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none w-full md:w-64 transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none text-sm font-medium transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <LayoutList className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Total Tasks</p>
            <h3 className="text-2xl font-bold">{tasks.length}</h3>
          </div>
        </div>
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">In Progress</p>
            <h3 className="text-2xl font-bold">{tasks.filter(t => t.status === 'In Progress').length}</h3>
          </div>
        </div>
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Completed</p>
            <h3 className="text-2xl font-bold">{tasks.filter(t => t.status === 'Done').length}</h3>
          </div>
        </div>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[hsl(var(--muted))]/10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Task Name</th>
                <th className="px-6 py-4 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredTasks.map((task) => {
                const project = projects.find(p => p.id === task.project_id);
                return (
                  <tr key={task.id} className="hover:bg-[hsl(var(--muted))]/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-2 h-2 rounded-full",
                          task.status === 'Done' ? "bg-green-500" :
                          task.status === 'In Progress' ? "bg-blue-500" : "bg-gray-400"
                        )} />
                        <span className="text-sm font-semibold group-hover:text-[hsl(var(--primary))] transition-colors">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-2 py-1 rounded-md font-medium">
                        {project?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        task.priority === 'Urgent' ? "bg-purple-500/10 text-purple-600" :
                        task.priority === 'High' ? "bg-red-500/10 text-red-600" :
                        task.priority === 'Medium' ? "bg-yellow-500/10 text-yellow-600" :
                        "bg-blue-500/10 text-blue-600"
                      )}>
                        {task.priority === 'Urgent' && <AlertCircle className="w-2.5 h-2.5" />}
                        {task.priority}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 font-medium">
                        <Clock className="w-3 h-3" />
                        {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No date'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/project/${task.project_id}`}
                        className="p-2 hover:bg-[hsl(var(--primary))]/10 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] rounded-lg transition-all inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                      >
                        View Project
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-[hsl(var(--muted-foreground))]">
                    No tasks found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
