import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  MessageSquare,
  Heart,
  Sparkles,
  Users,
  Leaf,
  MapPin,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/hybrid-day', label: 'Hybrid Day', icon: Calendar },
  { path: '/finance', label: 'Finance', icon: Wallet },
  { path: '/coach', label: 'AI Coach', icon: MessageSquare },
  { path: '/wellness', label: 'Wellness', icon: Heart },
];

const discoverNavItems: NavItem[] = [
  { path: '/herbs', label: 'Herb Library', icon: Leaf },
  { path: '/places', label: 'Discover', icon: MapPin },
  { path: '/shop', label: 'Shop', icon: ShoppingBag },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/motivation', label: 'Motivation', icon: Sparkles },
];

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const NavSection: React.FC<{ title: string; items: NavItem[] }> = ({
    title,
    items,
  }) => (
    <div className="mb-6">
      <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              )
            }
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 text-xs bg-amber-500 text-zinc-950 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64',
          'bg-zinc-950 border-r border-zinc-800',
          'flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-zinc-950" />
            </div>
            <span className="text-lg font-bold text-zinc-100">Luminary</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavSection title="Main" items={mainNavItems} />
          <NavSection title="Discover" items={discoverNavItems} />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800">
          <NavLink
            to="/profile"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-2',
              location.pathname === '/profile'
                ? 'bg-amber-500/10 text-amber-400'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-zinc-400">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-100 truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </NavLink>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Mobile header
export const MobileHeader: React.FC = () => {
  const { setSidebarOpen } = useUIStore();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
          </div>
          <span className="text-lg font-bold text-zinc-100">Luminary</span>
        </div>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>
    </header>
  );
};
