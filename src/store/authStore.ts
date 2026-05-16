import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemo: () => void;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
}

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';
export const DEMO_EMAIL = 'santhiyamohandvk@gmail.com';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null });
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile });
      }
      
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: session?.user ?? null });
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          set({ profile });
        } else {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
  loginAsDemo: () => {
    const demoUser = {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      user_metadata: { full_name: 'Santhiya' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any;

    const demoProfile = {
      id: DEMO_USER_ID,
      full_name: 'Santhiya',
      avatar_url: 'https://ui-avatars.com/api/?name=Santhiya&background=0D8ABC&color=fff',
      email: DEMO_EMAIL,
    };

    set({ user: demoUser, profile: demoProfile, initialized: true, loading: false });
  },
  updateProfile: async (updates) => {
    const { user, profile } = useAuthStore.getState();
    if (!user) return;

    if (user.id === DEMO_USER_ID) {
      set({ profile: { ...profile, ...updates } });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    set({ profile: { ...profile, ...updates } });
  },
  uploadAvatar: async (file) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    if (user.id === DEMO_USER_ID) {
      // For demo, return a data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  },
}));
