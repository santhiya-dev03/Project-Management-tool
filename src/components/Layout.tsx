import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, LogOut, Settings, Bell, Menu, X, Calendar, Users, BarChart3, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[hsl(var(--border))]">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-purple-500 bg-clip-text text-transparent">
            CollabBoard
          </h1>
          <button 
            className="lg:hidden p-1 text-[hsl(var(--muted-foreground))]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[hsl(var(--primary))] to-purple-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                {profile?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] rounded-lg hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between lg:justify-end px-4 lg:px-8 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 backdrop-blur-sm sticky top-0 z-10">
          <button 
            className="lg:hidden p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 lg:gap-4">
            <ThemeToggle />
            <button className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--destructive))]"></span>
            </button>
            <Link to="/settings" className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-full transition-colors hidden sm:block">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Horizontal Navigation Tabs */}
        <div className="px-4 lg:px-8 pt-4 bg-[hsl(var(--card))]/50 backdrop-blur-sm border-b border-[hsl(var(--border))] hidden sm:block overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2',
                    isActive
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
