import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  status: 'Online' | 'Offline' | 'Away';
  tasks: number;
  performance: number;
  avatar_url?: string;
}

interface TeamState {
  members: TeamMember[];
  loading: boolean;
  fetchMembers: () => Promise<void>;
  inviteMember: (email: string, role: TeamMember['role']) => Promise<void>;
  updateMemberRole: (id: string, role: TeamMember['role']) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  members: [],
  loading: false,
  fetchMembers: async () => {
    set({ loading: true });
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        const mappedMembers: TeamMember[] = profiles.map(p => ({
          id: p.id,
          name: p.full_name || p.email.split('@')[0],
          email: p.email,
          role: 'Member', // Default role if not stored in profiles
          status: 'Online', // Status could be real if you have presence
          tasks: Math.floor(Math.random() * 10), // Mocked for now
          performance: 85 + Math.floor(Math.random() * 15), // Mocked for now
          avatar_url: p.avatar_url
        }));
        set({ members: mappedMembers });
      } else {
        // Fallback for demo
        set({
          members: [
            { id: '1', name: 'Santhiya', email: 'santhiyamohandvk@gmail.com', role: 'Owner', status: 'Online', tasks: 12, performance: 95 },
            { id: '2', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Offline', tasks: 8, performance: 88 },
            { id: '3', name: 'Alice Smith', email: 'alice@example.com', role: 'Member', status: 'Online', tasks: 5, performance: 92 },
            { id: '4', name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'Away', tasks: 0, performance: 0 },
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      set({ loading: false });
    }
  },
  inviteMember: async (email, role) => {
    // In a real app, this would send an invitation via Supabase Edge Functions or Email
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
      status: 'Offline',
      tasks: 0,
      performance: 0
    };
    set({ members: [...get().members, newMember] });
  },
  updateMemberRole: async (id, role) => {
    set({
      members: get().members.map(m => m.id === id ? { ...m, role } : m)
    });
  },
  removeMember: async (id) => {
    set({
      members: get().members.filter(m => m.id !== id)
    });
  }
}));
