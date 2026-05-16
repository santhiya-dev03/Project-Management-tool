import { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Play, 
  Square, 
  MessageSquare, 
  Paperclip, 
  Calendar as CalendarIcon,
  Tag,
  Send,
  Plus,
  CheckSquare
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { useTeamStore } from '../store/teamStore';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { toast } from 'sonner';

interface Props {
  taskId: string;
  onClose: () => void;
}

export default function TaskDetail({ taskId, onClose }: Props) {
  const { tasks, updateTask, addComment, createSubtask } = useTaskStore();
  const { profile } = useAuthStore();
  const { members, fetchMembers } = useTeamStore();
  const task = tasks.find(t => t.id === taskId);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(task?.time_spent || 0);
  const [comment, setComment] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [description, setDescription] = useState(task?.description || '');
  const [subtaskTitle, setSubtaskTitle] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const assignee = members.find(m => m.id === task?.assigned_to);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!task) return null;

  const handleToggleTimer = async () => {
    if (isTimerRunning) {
      // Sync with store when stopping
      await updateTask(task.id, { time_spent: seconds });
      toast.success('Time log saved');
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !profile) return;
    
    try {
      await addComment(task.id, {
        task_id: task.id,
        user_id: profile.id,
        user_name: profile.full_name || 'User',
        user_avatar: profile.avatar_url,
        content: comment
      });
      setComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleSaveDescription = async () => {
    await updateTask(task.id, { description });
    setIsEditingDesc(false);
    toast.success('Description updated');
  };
  
  const handleCreateSubtask = async () => {
    if (!subtaskTitle.trim()) return;
    await createSubtask(task.id, {
      project_id: task.project_id,
      title: subtaskTitle,
      description: '',
      priority: 'Medium',
      status: 'To Do',
      due_date: null,
      assigned_to: null,
    });
    setSubtaskTitle('');
    toast.success('Subtask created');
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-end p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-[hsl(var(--card))] w-full max-w-2xl h-full sm:h-[95vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col border-l border-[hsl(var(--border))] animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))] shrink-0">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              task.priority === 'Urgent' ? "bg-purple-500/10 text-purple-600" :
              task.priority === 'High' ? "bg-red-500/10 text-red-600" :
              "bg-blue-500/10 text-blue-600"
            )}>
              {task.priority}
            </div>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">#{task.id.slice(0, 8)}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Title Section */}
          <section>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4 leading-tight">{task.title}</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-[hsl(var(--border))]">
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-semibold">Assignee</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                    {assignee?.avatar_url ? <img src={assignee.avatar_url} alt="" /> : (assignee?.name?.charAt(0) || '?')}
                  </div>
                  <span className="text-sm font-medium">{assignee?.name || 'Unassigned'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-semibold">Due Date</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CalendarIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No date'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-semibold">Status</span>
                <div className="flex items-center gap-2">
                  <div className={clsx("w-2 h-2 rounded-full", 
                    task.status === 'Done' ? "bg-green-500" : 
                    task.status === 'In Progress' ? "bg-blue-500" : "bg-gray-400"
                  )} />
                  <span className="text-sm font-medium">{task.status}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-semibold">Time Spent</span>
                <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]">
                  <Clock className="w-4 h-4" />
                  {formatTime(seconds)}
                </div>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                Description
              </h2>
              {!isEditingDesc && (
                <button 
                  onClick={() => setIsEditingDesc(true)}
                  className="text-sm text-[hsl(var(--primary))] hover:underline font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            
            {isEditingDesc ? (
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none min-h-[200px] text-sm"
                  placeholder="Supports Markdown... **bold**, *italic*, # Heading"
                />
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setIsEditingDesc(false)}
                    className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveDescription}
                    className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg text-sm font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-[hsl(var(--foreground))] text-sm leading-relaxed bg-[hsl(var(--muted))]/10 p-4 rounded-xl border border-[hsl(var(--border))/30">
                {description ? (
                  <ReactMarkdown>{description}</ReactMarkdown>
                ) : (
                  <p className="italic text-[hsl(var(--muted-foreground))]">No description provided.</p>
                )}
              </div>
            )}
          </section>

          {/* Subtasks Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[hsl(var(--primary))]" />
              Subtasks
            </h2>
            
            <div className="space-y-2">
              {tasks.filter(t => t.parent_id === task.id).map(sub => (
                <div key={sub.id} className="flex items-center gap-3 p-3 bg-[hsl(var(--muted))]/5 border border-[hsl(var(--border))] rounded-lg hover:border-[hsl(var(--primary))]/50 transition-all group">
                  <input 
                    type="checkbox" 
                    checked={sub.status === 'Done'}
                    onChange={() => updateTask(sub.id, { status: sub.status === 'Done' ? 'To Do' : 'Done' })}
                    className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]" 
                  />
                  <span className={clsx("text-sm font-medium", sub.status === 'Done' && "line-through text-[hsl(var(--muted-foreground))]")}>
                    {sub.title}
                  </span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                      {sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSubtask()}
                placeholder="Add a subtask..."
                className="flex-1 px-3 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none text-sm"
              />
              <button 
                onClick={handleCreateSubtask}
                className="p-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--primary))] hover:text-white transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Activity/Comments Section */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
            </h2>
            
            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((c) => (
                  <div key={c.id} className="flex gap-4 p-4 bg-[hsl(var(--muted))]/10 rounded-xl border border-[hsl(var(--border))/50 relative group animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden">
                      {c.user_avatar ? (
                        <img src={c.user_avatar} alt={c.user_name} className="w-full h-full object-cover" />
                      ) : (
                        c.user_name.charAt(0)
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{c.user_name}</span>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                          {format(new Date(c.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--foreground))]">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-[hsl(var(--muted))]/5 rounded-xl border border-dashed border-[hsl(var(--border))]">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="relative mt-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-4 pr-16 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none min-h-[100px] text-sm shadow-sm"
              />
              <button 
                onClick={handleAddComment}
                className="absolute bottom-4 right-4 p-2 bg-[hsl(var(--primary))] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                disabled={!comment.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleToggleTimer}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-md",
                isTimerRunning 
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
                  : "bg-green-500 text-white hover:bg-green-600"
              )}
            >
              {isTimerRunning ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] rounded-xl transition-all font-medium border border-transparent hover:border-[hsl(var(--border))]">
              <Paperclip className="w-4 h-4" />
              Attach Files
            </button>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
               <Tag className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
