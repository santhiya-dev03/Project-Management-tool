import { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Link } from 'react-router-dom';
import { Plus, Folder, Trash2, Search, Download, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import clsx from 'clsx';

export default function Dashboard() {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleExport = () => {
    const data = projects.map(p => ({
      name: p.name,
      description: p.description,
      created_at: p.created_at
    }));
    const csv = [
      ['Name', 'Description', 'Created At'],
      ...data.map(p => [p.name, p.description, p.created_at])
    ].map(e => e.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    await createProject(newProjectName, newProjectDesc);
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Projects</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your collaborative workspaces</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
            <input 
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg font-medium hover:bg-[hsl(var(--secondary))]/80 transition-all shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:bg-[hsl(var(--primary))]/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-semibold mb-4 text-[hsl(var(--foreground))]">Create New Project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input
                type="text"
                required
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                placeholder="E.g., Marketing Campaign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none resize-none"
                placeholder="What is this project about?"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary))]/90 shadow-sm"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--card))]/50">
          <Folder className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">No projects yet</h3>
          <p className="text-[hsl(var(--muted-foreground))] mt-1 mb-6">Create your first project to get started.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:bg-[hsl(var(--primary))]/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-[hsl(var(--card))]/50 border border-[hsl(var(--border))] rounded-2xl">
          <Search className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-50" />
          <p className="text-[hsl(var(--muted-foreground))]">No projects found matching "{searchQuery}"</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 text-[hsl(var(--primary))] hover:underline text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
// ... existing card content ...
            <div
              key={project.id}
              className="group relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 hover:shadow-md hover:border-[hsl(var(--primary))]/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-purple-500 flex items-center justify-center text-white shadow-sm">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className={clsx(
                      "text-[10px] font-bold flex items-center gap-1",
                      (project.stats?.healthScore || 0) >= 80 ? "text-green-500" :
                      (project.stats?.healthScore || 0) >= 50 ? "text-yellow-500" : "text-red-500"
                    )}>
                      <Activity className="w-3 h-3" />
                      {(project.stats?.healthScore || 0) >= 80 ? 'Healthy' : 
                       (project.stats?.healthScore || 0) >= 50 ? 'At Risk' : 'Critical'}
                    </span>
                    <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                      Score: {project.stats?.healthScore || 0}% • {project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0} Tasks
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toast.warning('Are you sure you want to delete this project?', {
                      action: {
                        label: 'Delete',
                        onClick: () => {
                          deleteProject(project.id);
                          toast.success('Project deleted successfully');
                        }
                      },
                      cancel: {
                        label: 'Cancel',
                        onClick: () => {}
                      }
                    });
                  }}
                  className="p-1.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <Link to={`/project/${project.id}`} className="block focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 rounded-md">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-4 h-10">
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex items-center text-xs text-[hsl(var(--muted-foreground))]">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
