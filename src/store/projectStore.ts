import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DEMO_USER_ID } from './authStore';

export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    healthScore: number;
  }
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  fetchProjects: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if we are in demo mode
      if (!user || user.id === DEMO_USER_ID) {
        // Return mock projects for demo user
        const mockProjects: Project[] = [
          {
            id: 'demo-p1',
            name: 'Website Redesign',
            description: 'Redesigning the corporate website with modern aesthetics.',
            owner_id: DEMO_USER_ID,
            created_at: new Date().toISOString(),
            stats: { totalTasks: 24, completedTasks: 18, healthScore: 92 }
          },
          {
            id: 'demo-p2',
            name: 'Mobile App Development',
            description: 'Building a cross-platform mobile app using React Native.',
            owner_id: DEMO_USER_ID,
            created_at: new Date().toISOString(),
            stats: { totalTasks: 15, completedTasks: 4, healthScore: 45 }
          }
        ];
        set({ projects: mockProjects });
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ projects: data as Project[] });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      set({ loading: false });
    }
  },
  createProject: async (name: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([{ name, description, owner_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      const newProject = data as Project;
      
      // Add user as admin member
      await supabase.from('project_members').insert([
        { project_id: newProject.id, user_id: user.id, role: 'admin' }
      ]);
      
      set({ projects: [newProject, ...get().projects] });
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  },
  deleteProject: async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      set({ projects: get().projects.filter(p => p.id !== id) });
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }
}));
