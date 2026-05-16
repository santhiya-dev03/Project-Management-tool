import { useEffect, useState } from 'react';
import { X, Send, Hash } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function TeamChat({ onClose }: { onClose: () => void }) {
  const { id: projectId } = useParams();
  const { messages, fetchMessages, sendMessage, loading } = useChatStore();
  const { profile } = useAuthStore();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchMessages(projectId);
    }
  }, [projectId, fetchMessages]);

  const handleSend = async () => {
    if (!input.trim() || !projectId) return;
    await sendMessage(projectId, input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[70] animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 bg-[hsl(var(--primary))] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          <h3 className="font-bold">Project Chat</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/30"></div>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === profile?.id;
          return (
            <div key={msg.id} className={clsx(
              "flex flex-col",
              isOwn ? "items-end" : "items-start"
            )}>
              <div className="flex items-center gap-2 mb-1 px-1">
                {!isOwn && (
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold overflow-hidden">
                    {msg.user_avatar ? <img src={msg.user_avatar} alt="" /> : msg.user_name.charAt(0)}
                  </div>
                )}
                <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase">{msg.user_name}</span>
                <span className="text-[9px] text-[hsl(var(--muted-foreground))] opacity-50">
                  {format(new Date(msg.created_at), 'h:mm a')}
                </span>
              </div>
              <div className={clsx(
                "max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                isOwn 
                  ? "bg-[hsl(var(--primary))] text-white rounded-tr-none" 
                  : "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="w-full pl-4 pr-12 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none text-sm shadow-inner"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
