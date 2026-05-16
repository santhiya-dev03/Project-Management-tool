import { useState, useRef } from 'react';
import { User, Bell, Shield, Palette, Save, LogOut, UserCircle, Mail, Lock, Smartphone, Key } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import clsx from 'clsx';

import { toast } from 'sonner';

type TabId = 'profile' | 'notifications' | 'security' | 'appearance';

export default function Settings() {
  const { profile, signOut, updateProfile, uploadAvatar } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email] = useState(profile?.email || '');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    tasks: true,
    mentions: true
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ full_name: fullName });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading image...', { id: 'upload-avatar' });
      const publicUrl = await uploadAvatar(file);
      await updateProfile({ avatar_url: publicUrl });
      toast.success('Profile picture updated!', { id: 'upload-avatar' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image', { id: 'upload-avatar' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your account preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <aside className="md:col-span-1 space-y-1">
          <nav className="flex flex-col gap-1">
            {[
              { id: 'profile' as TabId, label: 'Profile', icon: UserCircle },
              { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
              { id: 'security' as TabId, label: 'Security', icon: Shield },
              { id: 'appearance' as TabId, label: 'Appearance', icon: Palette },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left",
                  activeTab === tab.id
                    ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Profile Section */}
              <section className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
                  <h2 className="text-lg font-bold">Profile Information</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Update your personal details and how others see you.</p>
                </div>
                <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[hsl(var(--primary))] to-purple-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0 overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        fullName.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Profile Photo</h3>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--secondary))]/80 transition-all"
                        >
                          Change
                        </button>
                        <button 
                          type="button" 
                          onClick={() => updateProfile({ avatar_url: undefined })}
                          className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-all rounded-md"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2 bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-lg font-bold hover:shadow-lg transition-all text-sm">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>

              {/* Danger Zone */}
              <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h2>
                <p className="text-sm text-red-600/70 mb-6">Irreversible actions that affect your account and data.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => {
                      toast.promise(signOut(), {
                        loading: 'Signing out...',
                        success: 'Signed out from all devices',
                        error: 'Failed to sign out'
                      });
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out from All Devices
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure? This will PERMANENTLY delete your account data.')) {
                        toast.error('Account deletion requested. Please contact support to finalize.');
                      }
                    }}
                    className="px-6 py-2 text-sm font-bold text-red-600 border border-red-500/30 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
                  <h2 className="text-lg font-bold">Notification Preferences</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Control how and when you receive updates.</p>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive daily digests and project updates via email.' },
                    { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts on your desktop or mobile device.' },
                    { id: 'tasks', label: 'Task Assignments', desc: 'Notify me when I am assigned to a new task.' },
                    { id: 'mentions', label: 'Mentions & Comments', desc: 'Notify me when someone mentions me in a comment.' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-[hsl(var(--muted))]/5 rounded-xl border border-[hsl(var(--border))]">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                        className={clsx(
                          "w-10 h-5 rounded-full transition-all relative",
                          notifications[item.id as keyof typeof notifications] ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"
                        )}
                      >
                        <div className={clsx(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          notifications[item.id as keyof typeof notifications] ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
                  <h2 className="text-lg font-bold">Security Settings</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Protect your account and manage access.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Password</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-xs font-bold bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg hover:bg-[hsl(var(--secondary))]/80 transition-all">
                      Update Password
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-[hsl(var(--border))]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Two-Factor Authentication</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-xs font-bold text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 rounded-lg hover:bg-[hsl(var(--primary))]/10 transition-all">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Active Sessions</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Devices currently logged into your account.</p>
                  </div>
                  <button className="text-xs font-bold text-red-500 hover:underline">Revoke All</button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                        <Key className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Chrome on Windows</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Current session • India</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Active Now</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
                  <h2 className="text-lg font-bold">Appearance</h2>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Customize how CollabBoard looks on your device.</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={clsx(
                        "p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-3",
                        theme === 'light' ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/30"
                      )}
                    >
                      <div className="w-full h-12 bg-white rounded-lg border border-gray-200 shadow-inner flex items-center px-2">
                        <div className="w-4 h-4 bg-gray-100 rounded mr-2" />
                        <div className="flex-1 space-y-1">
                          <div className="w-1/2 h-1 bg-gray-200 rounded" />
                          <div className="w-3/4 h-1 bg-gray-100 rounded" />
                        </div>
                      </div>
                      <span className="text-sm font-bold">Light Mode</span>
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={clsx(
                        "p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-3",
                        theme === 'dark' ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm" : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/30"
                      )}
                    >
                      <div className="w-full h-12 bg-gray-900 rounded-lg border border-gray-800 shadow-inner flex items-center px-2">
                        <div className="w-4 h-4 bg-gray-800 rounded mr-2" />
                        <div className="flex-1 space-y-1">
                          <div className="w-1/2 h-1 bg-gray-700 rounded" />
                          <div className="w-3/4 h-1 bg-gray-800 rounded" />
                        </div>
                      </div>
                      <span className="text-sm font-bold">Dark Mode</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
