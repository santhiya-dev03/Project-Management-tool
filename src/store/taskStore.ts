import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DEMO_USER_ID } from './authStore';

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  parent_id?: string | null;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assigned_to: string | null;
  due_date: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  created_at: string;
  time_spent: number;
  comments?: Comment[];
  subtasks?: Task[];
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'time_spent'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: Task['status']) => Promise<void>;
  createSubtask: (parentId: string, task: Omit<Task, 'id' | 'created_at' | 'parent_id' | 'time_spent'>) => Promise<void>;
  addComment: (taskId: string, comment: Omit<Comment, 'id' | 'created_at'>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  fetchTasks: async (projectId: string) => {
    set({ loading: true });
    try {
      if (projectId.startsWith('demo-')) {
        // Return mock tasks for demo projects
        const mockTasks: Task[] = [
          {
            id: 'demo-t1',
            project_id: projectId,
            title: 'Design Hero Section',
            description: 'Create a high-fidelity mockup for the landing page hero.',
            status: 'Done',
            assigned_to: DEMO_USER_ID,
            due_date: new Date().toISOString(),
            priority: 'High',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            time_spent: 7200,
            comments: [
              { id: 'c1', task_id: 'demo-t1', user_id: 'u2', user_name: 'John Doe', content: 'The colors look great!', created_at: new Date(Date.now() - 3600000).toISOString() }
            ]
          },
          {
            id: 'demo-t2',
            project_id: projectId,
            title: 'Implement Auth Flow',
            description: 'Connect the login and signup pages to Supabase.',
            status: 'In Progress',
            assigned_to: DEMO_USER_ID,
            due_date: new Date().toISOString(),
            priority: 'Medium',
            created_at: new Date(Date.now() - 43200000).toISOString(),
            time_spent: 3600,
            comments: []
          },
          {
            id: 'demo-t3',
            project_id: projectId,
            title: 'API Integration',
            description: 'Fetch real data from the backend services.',
            status: 'To Do',
            assigned_to: null,
            due_date: null,
            priority: 'Low',
            created_at: new Date().toISOString(),
            time_spent: 0,
            comments: []
          }
        ];
        set({ tasks: mockTasks });
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*, comments(*)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ tasks: data as Task[] });

      // Setup Realtime subscription
      supabase.channel(`tasks-${projectId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
          (payload) => {
            const currentTasks = get().tasks;
            if (payload.eventType === 'INSERT') {
              if (!currentTasks.some(t => t.id === payload.new.id)) {
                set({ tasks: [payload.new as Task, ...currentTasks] });
              }
            } else if (payload.eventType === 'UPDATE') {
              set({
                tasks: currentTasks.map(t => t.id === payload.new.id ? payload.new as Task : t)
              });
            } else if (payload.eventType === 'DELETE') {
              set({
                tasks: currentTasks.filter(t => t.id !== payload.old.id)
              });
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      set({ loading: false });
    }
  },
  createTask: async (task) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, time_spent: 0 }])
        .select()
        .single();

      if (error) throw error;
      set({ tasks: [{ ...data, comments: [] } as Task, ...get().tasks] });
    } catch (error) {
      console.error('Error creating task:', error);
      // Fallback for demo mode if supabase fails
      const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        time_spent: 0,
        comments: []
      };
      set({ tasks: [newTask, ...get().tasks] });
    }
  },
  updateTask: async (id, updates) => {
    try {
      // Optimistic update
      const prevTasks = get().tasks;
      set({
        tasks: prevTasks.map(t => t.id === id ? { ...t, ...updates } : t)
      });
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) {
        // Revert on error
        set({ tasks: prevTasks });
        throw error;
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  },
  deleteTask: async (id) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      set({ tasks: get().tasks.filter(t => t.id !== id) });
    } catch (error) {
      console.error('Error deleting task:', error);
      // Fallback for demo
      set({ tasks: get().tasks.filter(t => t.id !== id) });
    }
  },
  moveTask: async (id, newStatus) => {
    await get().updateTask(id, { status: newStatus });
  },
  createSubtask: async (parentId, task) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, parent_id: parentId, time_spent: 0 }])
        .select()
        .single();

      if (error) throw error;
      set({ tasks: [{ ...data, comments: [] } as Task, ...get().tasks] });
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  },
  addComment: async (taskId, comment) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ ...comment, task_id: taskId }])
        .select()
        .single();

      if (error) throw error;
      
      set({
        tasks: get().tasks.map(t => 
          t.id === taskId 
            ? { ...t, comments: [...(t.comments || []), data as Comment] } 
            : t
        )
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      // Fallback for demo
      const newComment: Comment = {
        ...comment,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        task_id: taskId
      };
      set({
        tasks: get().tasks.map(t => 
          t.id === taskId 
            ? { ...t, comments: [...(t.comments || []), newComment] } 
            : t
        )
      });
    }
  }
}));
