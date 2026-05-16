import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DEMO_USER_ID } from './authStore';

export interface Message {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  project_id: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  fetchMessages: (projectId: string) => Promise<void>;
  sendMessage: (projectId: string, content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  fetchMessages: async (projectId: string) => {
    set({ loading: true });
    try {
      if (projectId.startsWith('demo-')) {
        set({
          messages: [
            { id: '1', user_id: 'u2', user_name: 'John Doe', content: 'Hey team, how is the progress on the redesign?', created_at: new Date(Date.now() - 3600000).toISOString(), project_id: projectId },
            { id: '2', user_id: 'u3', user_name: 'Alice Smith', content: 'Just finished the hero section. Moving to the dashboard now.', created_at: new Date(Date.now() - 1800000).toISOString(), project_id: projectId },
          ]
        });
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ messages: data as Message[] });

      // Setup Realtime subscription
      supabase.channel(`chat-${projectId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
          (payload) => {
            const currentMessages = get().messages;
            if (!currentMessages.some(m => m.id === payload.new.id)) {
              set({ messages: [...currentMessages, payload.new as Message] });
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      set({ loading: false });
    }
  },
  sendMessage: async (projectId, content) => {
    try {
      const { profile } = (await import('./authStore')).useAuthStore.getState();
      if (!profile) throw new Error('Not authenticated');

      const newMessageData = {
        project_id: projectId,
        user_id: profile.id,
        user_name: profile.full_name || 'Anonymous',
        user_avatar: profile.avatar_url,
        content: content,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([newMessageData])
        .select()
        .single();

      if (error) throw error;
      set({ messages: [...get().messages, data as Message] });
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback for demo
      const { profile } = (await import('./authStore')).useAuthStore.getState();
      const mockMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: profile?.id || DEMO_USER_ID,
        user_name: profile?.full_name || 'Santhiya',
        user_avatar: profile?.avatar_url,
        content: content,
        created_at: new Date().toISOString(),
        project_id: projectId
      };
      set({ messages: [...get().messages, mockMsg] });
    }
  }
}));
