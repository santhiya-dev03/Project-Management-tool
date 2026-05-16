import { useState } from 'react';
import {
  UserPlus,
  Search,
  Mail,
  Shield,
  MoreVertical,
  Activity,
  CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

import { useTeamStore } from '../store/teamStore';
import { toast } from 'sonner';

export default function Team() {
  const { members, loading, fetchMembers, inviteMember, removeMember } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Member' | 'Viewer'>('Member');

  useState(() => {
    fetchMembers();
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    await inviteMember(inviteEmail, inviteRole);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Team Members</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your team and their access levels</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--primary))] transition-colors" />
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {members.length === 0 && !loading ? (
        <div className="text-center py-20 bg-[hsl(var(--card))]/50 border border-dashed border-[hsl(var(--border))] rounded-2xl">
          <p className="text-[hsl(var(--muted-foreground))]">No team members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
              <div className="absolute top-4 right-4 flex gap-1">
                <button 
                  onClick={() => {
                    toast.promise(removeMember(member.id), {
                      loading: 'Removing member...',
                      success: 'Member removed',
                      error: 'Failed to remove'
                    });
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove Member"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[hsl(var(--primary))] to-purple-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                <div className={clsx(
                  "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[hsl(var(--card))]",
                  member.status === 'Online' ? "bg-green-500" :
                    member.status === 'Away' ? "bg-yellow-500" : "bg-gray-400"
                )} />
              </div>

              <div>
                <h3 className="font-bold text-[hsl(var(--foreground))]">{member.name}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{member.email}</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                {member.role}
              </div>

              <div className="w-full pt-4 border-t border-[hsl(var(--border))] grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold uppercase">Tasks</p>
                  <p className="text-sm font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {member.tasks}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-bold uppercase">Perf.</p>
                  <p className="text-sm font-bold flex items-center justify-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    {member.performance}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
              <h2 className="text-xl font-bold">Invite Team Member</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Send an invitation link to collaborate.</p>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all"
                    placeholder="teammate@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all"
                >
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg font-bold hover:bg-[hsl(var(--secondary))]/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
